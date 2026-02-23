// mailtrap.ts
export type MailtrapConfig = {
  apiToken: string;
  accountId: string;
  inboxId: string;
};

export type MailtrapMessage = {
  id: number;
  subject: string;
  from_email: string;
  to_email: string;
  created_at: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mailtrapFetch<T>(cfg: MailtrapConfig, path: string, method: string = "GET"): Promise<T> {
  const headers: Record<string, string> = {
    "Api-Token": cfg.apiToken,
    "Content-Type": "application/json",
  };

  // For PATCH requests (like clean), use the more specific accept header
  if (method === "PATCH") {
    headers["Accept"] = "application/json, application/vnd.mailtrap.v2-MT-UI";
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  const res = await fetch(`https://mailtrap.io/api/accounts/${cfg.accountId}${path}`, {
    method,
    headers,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Mailtrap API error ${res.status}: ${txt}`);
  }

  // Check content type to determine how to parse the response
  const contentType = res.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  } else {
    // For non-JSON responses (like HTML, text), return as text
    return (await res.text()) as T;
  }
}

export async function getMessages(cfg: MailtrapConfig): Promise<MailtrapMessage[]> {
  return await mailtrapFetch<MailtrapMessage[]>(
    cfg,
    `/inboxes/${cfg.inboxId}/messages`
  );
}

export async function getMessageId(cfg: MailtrapConfig, toEmail: string, subject: string): Promise<number | null> {
  const messages = await getMessages(cfg);
  const foundMessage = messages.find(msg => msg.to_email === toEmail && msg.subject.includes(subject));
  return foundMessage ? foundMessage.id : null;
}

export async function getRawMessage(cfg: MailtrapConfig, toEmail: string, subject: string): Promise<string> {
  // Get message ID first
  const messageId = await getMessageId(cfg, toEmail, subject);
  
  if (!messageId) {
    throw new Error(`No message found for email: ${toEmail} with subject: ${subject}`);
  }
  
  // Get raw email body
  const rawMessage = await mailtrapFetch<string>(
    cfg,
    `/inboxes/${cfg.inboxId}/messages/${messageId}/body.raw`
  );
  
  return rawMessage;
}

export async function getHTMLMessage(cfg: MailtrapConfig, toEmail: string, subject: string): Promise<string> {
  // Get message ID first
  const messageId = await getMessageId(cfg, toEmail, subject);
  
  if (!messageId) {
    throw new Error(`No message found for email: ${toEmail} with subject: ${subject}`);
  }
  
  // Get formatted HTML email body
  const htmlMessage = await mailtrapFetch<string>(
    cfg,
    `/inboxes/${cfg.inboxId}/messages/${messageId}/body.html`
  );
  
  return htmlMessage;
}

export async function getTextMessage(cfg: MailtrapConfig, toEmail: string, subject: string): Promise<string> {
  // Get message ID first
  const messageId = await getMessageId(cfg, toEmail, subject);
  
  if (!messageId) {
    throw new Error(`No message found for email: ${toEmail} with subject: ${subject}`);
  }
  
  // Get text email body, if it exists
  const textMessage = await mailtrapFetch<string>(
    cfg,
    `/inboxes/${cfg.inboxId}/messages/${messageId}/body.txt`
  );
  
  return textMessage;
}

export async function getRawMessageDealer(
  accountId: string,
  inboxId: string,
  messageId: number
): Promise<string> {
  // Get raw email body directly using message ID
  const rawMessage = await mailtrapFetch<string>(
    { apiToken: process.env.MAILTRAP_API_TOKEN!, accountId, inboxId },
    `/inboxes/${inboxId}/messages/${messageId}/body.raw`
  );
  
  return rawMessage;
}

export async function getHTMLMessageDealer(
  accountId: string,
  inboxId: string,
  messageId: number
): Promise<string> {
  // Get formatted HTML email body directly using message ID
  const htmlMessage = await mailtrapFetch<string>(
    { apiToken: process.env.MAILTRAP_API_TOKEN!, accountId, inboxId },
    `/inboxes/${inboxId}/messages/${messageId}/body.html`
  );
  
  return htmlMessage;
}

export async function getTextMessageDealer(
  accountId: string,
  inboxId: string,
  messageId: number
): Promise<string> {
  // Get text email body directly using message ID
  const textMessage = await mailtrapFetch<string>(
    { apiToken: process.env.MAILTRAP_API_TOKEN!, accountId, inboxId },
    `/inboxes/${inboxId}/messages/${messageId}/body.txt`
  );
  
  return textMessage;
}

export async function getDealerMessageId(
  cfg: MailtrapConfig, 
  dealerEmailAddress: string,
  consumerEmailAddress: string,
  expectedSubject: string,
  afterTime: string,
  options?: { timeoutMs?: number; intervalMs?: number }
): Promise<number | null> {
  const timeoutMs = options?.timeoutMs ?? 420_000;
  const intervalMs = options?.intervalMs ?? 30_000;
  const start = Date.now();
  const thresholdTime = new Date(afterTime);
  
  console.log(`Looking for dealer message to: ${dealerEmailAddress} with Reply-To: ${consumerEmailAddress} and subject: "${expectedSubject}" in messages created after ${afterTime}`);
  
  while (Date.now() - start < timeoutMs) {
    // Get all messages
    const messages = await getMessages(cfg);
    
    // Filter messages by time - only check messages after the specified time
    const filteredMessages = messages.filter(msg => {
      const messageTime = new Date(msg.created_at);
      return messageTime > thresholdTime;
    });
    
    console.log(`Checking ${filteredMessages.length} messages created after ${afterTime} for dealer email: ${dealerEmailAddress} with Reply-To: ${consumerEmailAddress}`);
    
    // Iterate through filtered messages and check headers for both dealer and consumer emails
    for (const message of filteredMessages) {
      try {
        console.log(`Checking message ID: ${message.id}, created: ${message.created_at}, subject: "${message.subject}"`);
        
        // Check if subject matches first (quick check)
        if (!message.subject.includes(expectedSubject)) {
          console.log(`Subject mismatch: expected "${expectedSubject}", got "${message.subject}"`);
          continue;
        }
        
        // Check if dealer email is in to_email (quick check)
        if (!message.to_email.toLowerCase().includes(dealerEmailAddress.toLowerCase())) {
          console.log(`To email mismatch: expected ${dealerEmailAddress}, got ${message.to_email}`);
          continue;
        }
        
        // Get raw message which includes headers
        const rawMessage = await mailtrapFetch<string>(
          cfg,
          `/inboxes/${cfg.inboxId}/messages/${message.id}/body.raw`
        );
        
        // Extract headers (everything before first double newline)
        const headerEndIndex = rawMessage.indexOf('\n\n');
        const headers = headerEndIndex !== -1 ? rawMessage.substring(0, headerEndIndex) : rawMessage;
        
        // Check for Reply-To header containing the consumer email address
        const replyToMatch = headers.match(/^Reply-To:\s*(.+)$/mi);
        if (replyToMatch) {
          const replyToValue = replyToMatch[1].trim();
          console.log(`Found Reply-To header: ${replyToValue}`);
          
          if (replyToValue.toLowerCase().includes(consumerEmailAddress.toLowerCase())) {
            console.log(`✅ Found matching dealer message! ID: ${message.id}`);
            console.log(`   To: ${message.to_email}`);
            console.log(`   Reply-To: ${replyToValue}`);
            console.log(`   Subject: ${message.subject}`);
            return message.id;
          } else {
            console.log(`Reply-To email mismatch: expected ${consumerEmailAddress}, got ${replyToValue}`);
          }
        } else {
          console.log(`No Reply-To header found in message ${message.id}`);
        }
      } catch (error) {
        console.warn(`Failed to get raw message for ID ${message.id}:`, error);
        // Continue to next message if this one fails
        continue;
      }
    }
    
    // If no matching message found, wait before next iteration
    console.log(`Dealer message not found in current messages, waiting ${intervalMs}ms before next check...`);
    await sleep(intervalMs);
  }
  
  console.log(`Timed out waiting for dealer message to: ${dealerEmailAddress} with Reply-To: ${consumerEmailAddress} and subject: "${expectedSubject}" after ${afterTime}`);
  return null;
}

export async function getDealerMessageIdByName(
  cfg: MailtrapConfig, 
  dealerEmailAddress: string,
  consumerName: string,
  expectedSubject: string,
  afterTime: string,
  options?: { timeoutMs?: number; intervalMs?: number }
): Promise<number | null> {
  const timeoutMs = options?.timeoutMs ?? 420_000;
  const intervalMs = options?.intervalMs ?? 30_000;
  const start = Date.now();
  const thresholdTime = new Date(afterTime);
  
  console.log(`Looking for dealer message to: ${dealerEmailAddress} with Name: ${consumerName} and subject: "${expectedSubject}" in messages created after ${afterTime}`);
  
  while (Date.now() - start < timeoutMs) {
    // Get all messages
    const messages = await getMessages(cfg);
    
    // Filter messages by time - only check messages after the specified time
    const filteredMessages = messages.filter(msg => {
      const messageTime = new Date(msg.created_at);
      return messageTime > thresholdTime;
    });
    
    console.log(`Checking ${filteredMessages.length} messages created after ${afterTime} for dealer email: ${dealerEmailAddress} with Name: ${consumerName}`);
    
    // Iterate through filtered messages and check HTML content for Name field
    for (const message of filteredMessages) {
      try {
        console.log(`Checking message ID: ${message.id}, created: ${message.created_at}, subject: "${message.subject}"`);
        
        // Check if subject matches first (quick check)
        if (!message.subject.includes(expectedSubject)) {
          console.log(`Subject mismatch: expected "${expectedSubject}", got "${message.subject}"`);
          continue;
        }
        
        // Check if dealer email is in to_email (quick check)
        if (!message.to_email.toLowerCase().includes(dealerEmailAddress.toLowerCase())) {
          console.log(`To email mismatch: expected ${dealerEmailAddress}, got ${message.to_email}`);
          continue;
        }
        
        // Get HTML message content to check for Name field
        const htmlContent = await mailtrapFetch<string>(
          cfg,
          `/inboxes/${cfg.inboxId}/messages/${message.id}/body.html`
        );
        
        // Extract Name value from HTML using regex
        // Looking for pattern: Name:<span style="...">ConsumerName</span>
        const nameMatch = htmlContent.match(/Name:\s*<span[^>]*>\s*([^<]+)\s*<\/span>/i);
        if (nameMatch) {
          const nameValue = nameMatch[1].trim();
          console.log(`Found Name field: ${nameValue}`);
          
          if (nameValue.toLowerCase() === consumerName.toLowerCase()) {
            console.log(`✅ Found matching dealer message! ID: ${message.id}`);
            console.log(`   To: ${message.to_email}`);
            console.log(`   Name: ${nameValue}`);
            console.log(`   Subject: ${message.subject}`);
            return message.id;
          } else {
            console.log(`Name mismatch: expected ${consumerName}, got ${nameValue}`);
          }
        } else {
          console.log(`No Name field found in message ${message.id}`);
        }
      } catch (error) {
        console.warn(`Failed to get HTML content for message ID ${message.id}:`, error);
        // Continue to next message if this one fails
        continue;
      }
    }
    
    // If no matching message found, wait before next iteration
    console.log(`Dealer message not found in current messages, waiting ${intervalMs}ms before next check...`);
    await sleep(intervalMs);
  }
  
  console.log(`Timed out waiting for dealer message to: ${dealerEmailAddress} with Name: ${consumerName} and subject: "${expectedSubject}" after ${afterTime}`);
  return null;
}

export type InboxCleanResponse = {
  id: number;
  name: string;
  emails_count: number;
  emails_unread_count: number;
  status: string;
  used: boolean;
  sent_messages_count: number;
  last_message_sent_at: string | null;
};

export async function cleanInbox(cfg: MailtrapConfig): Promise<InboxCleanResponse> {
  const response = await mailtrapFetch<InboxCleanResponse>(
    cfg,
    `/inboxes/${cfg.inboxId}/clean`,
    "PATCH"
  );
  
  console.log(`✅ Inbox cleaned successfully: ${response.name} (ID: ${response.id})`);
  console.log(`📧 Emails remaining: ${response.emails_count} total, ${response.emails_unread_count} unread`);
  console.log(`📤 Sent messages count: ${response.sent_messages_count}`);
  
  return response;
}

export async function waitForMessage(
  cfg: MailtrapConfig,
  predicateOrEmail: ((m: MailtrapMessage) => boolean) | string,
  subjectOrOpts?: string | { timeoutMs?: number; intervalMs?: number },
  opts?: { timeoutMs?: number; intervalMs?: number }
): Promise<MailtrapMessage> {
  let predicate: (msg: MailtrapMessage) => boolean;
  let options: { timeoutMs?: number; intervalMs?: number } | undefined;

  if (typeof predicateOrEmail === 'function') {
    // Case 1: waitForMessage(cfg, predicate, opts)
    predicate = predicateOrEmail;
    options = subjectOrOpts as { timeoutMs?: number; intervalMs?: number } | undefined;
  } else if (typeof subjectOrOpts === 'string') {
    // Case 2: waitForMessage(cfg, email, subject, opts)
    const email = predicateOrEmail;
    const subject = subjectOrOpts;
    predicate = (msg: MailtrapMessage) => msg.to_email === email && msg.subject === subject;
    options = opts;
  } else {
    // Case 3: waitForMessage(cfg, email, opts)
    const email = predicateOrEmail;
    predicate = (msg: MailtrapMessage) => msg.to_email === email;
    options = subjectOrOpts as { timeoutMs?: number; intervalMs?: number } | undefined;
  }

  const timeoutMs = options?.timeoutMs ?? 420_000;
  const intervalMs = options?.intervalMs ?? 30_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const msgs = await getMessages(cfg);
    const found = msgs.find(predicate);
    if (found) return found;
    await sleep(intervalMs);
  }

  const errorMessage = typeof predicateOrEmail === 'string' 
    ? `Timed out waiting for Mailtrap message to email: ${predicateOrEmail}${typeof subjectOrOpts === 'string' ? ` with subject: ${subjectOrOpts}` : ''}`
    : `Timed out waiting for Mailtrap message`;
  
  throw new Error(errorMessage);
}
