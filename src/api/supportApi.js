const API_BASE = "https://172.169.59.206";

export const createSupportTicket = async (title, content, author) => {
  const res = await fetch(`${API_BASE}/support/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
      author,
      category: "general",
    }),
  });

  return await res.json();
};

export const fetchSupportTickets = async () => {
  const res = await fetch(`${API_BASE}/support/`);
  return await res.json();
};

export const fetchSupportDetail = async (ticketId) => {
  const res = await fetch(`${API_BASE}/support/${ticketId}`);
  return await res.json();
};