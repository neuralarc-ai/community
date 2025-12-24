export function get15MinReminderEmailHtml(workshop: any): string {
  return `
    <h1>Workshop Reminder: ${workshop.title}</h1>
    <p>Your workshop "${workshop.title}" is starting in 15 minutes!</p>
    <p>${workshop.description}</p>
    <p>Join here: [Link to workshop]</p>
  `;
}

export function get5MinReminderEmailHtml(workshop: any): string {
  return `
    <h1>Last Call! Workshop: ${workshop.title}</h1>
    <p>Your workshop "${workshop.title}" is starting in 5 minutes!</p>
    <p>${workshop.description}</p>
    <p>Join here: [Link to workshop]</p>
  `;
}
