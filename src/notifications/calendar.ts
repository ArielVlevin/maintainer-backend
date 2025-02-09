const createGoogleCalendarEvent = async (accessToken: string) => {
  await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "Maintenance Check",
        start: { dateTime: "2024-02-10T10:00:00-07:00" },
        end: { dateTime: "2024-02-10T11:00:00-07:00" },
      }),
    }
  );
};
