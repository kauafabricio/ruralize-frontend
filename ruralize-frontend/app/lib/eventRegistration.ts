export type EventRegistrationData = {
  name: string;
  email: string;
  registration: string;
  course: string;
  phone: string;
  motivation: string;
  consent: boolean;
};

export type EventRegistrationRecord = EventRegistrationData & {
  id: string;
  eventSlug: string;
  registeredAt: string;
};

const FORM_STORAGE_KEY = "ruralize.eventRegistrationForms";
const REGISTERED_EVENTS_STORAGE_KEY = "ruralize.registeredEvents";
const EVENT_REGISTRATIONS_STORAGE_KEY = "ruralize.eventRegistrations";

export function readRegistrationForm(eventSlug: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const forms = readJsonRecord<EventRegistrationData>(FORM_STORAGE_KEY);
  return forms[eventSlug] ?? null;
}

export function hasRegistrationForm(eventSlug: string) {
  return Boolean(readRegistrationForm(eventSlug));
}

export function saveRegistrationForm(
  eventSlug: string,
  data: EventRegistrationData,
) {
  if (typeof window === "undefined") {
    return;
  }

  const forms = readJsonRecord<EventRegistrationData>(FORM_STORAGE_KEY);
  window.localStorage.setItem(
    FORM_STORAGE_KEY,
    JSON.stringify({
      ...forms,
      [eventSlug]: data,
    }),
  );
  saveRegistrationRecord(eventSlug, data);
}

export function readEventRegistrations(eventSlug: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const registrations = readJsonRecord<EventRegistrationRecord[]>(
    EVENT_REGISTRATIONS_STORAGE_KEY,
  );

  return Array.isArray(registrations[eventSlug])
    ? registrations[eventSlug]
    : [];
}

export function storeRegisteredEvent(eventSlug: string) {
  if (typeof window === "undefined") {
    return;
  }

  const registeredEvents = readRegisteredEventSlugs();

  if (!registeredEvents.includes(eventSlug)) {
    window.localStorage.setItem(
      REGISTERED_EVENTS_STORAGE_KEY,
      JSON.stringify([...registeredEvents, eventSlug]),
    );
  }
}

export function unregisterEvent(eventSlug: string, removeForm = false) {
  if (typeof window === "undefined") {
    return [];
  }

  const registeredEvents = readRegisteredEventSlugs().filter(
    (registeredEventSlug) => registeredEventSlug !== eventSlug,
  );

  window.localStorage.setItem(
    REGISTERED_EVENTS_STORAGE_KEY,
    JSON.stringify(registeredEvents),
  );

  if (removeForm) {
    const forms = readJsonRecord<EventRegistrationData>(FORM_STORAGE_KEY);
    delete forms[eventSlug];
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(forms));

    const registrations = readJsonRecord<EventRegistrationRecord[]>(
      EVENT_REGISTRATIONS_STORAGE_KEY,
    );
    delete registrations[eventSlug];
    window.localStorage.setItem(
      EVENT_REGISTRATIONS_STORAGE_KEY,
      JSON.stringify(registrations),
    );
  }

  return registeredEvents;
}

export function readRegisteredEventSlugs() {
  if (typeof window === "undefined") {
    return [];
  }

  const currentValue = window.localStorage.getItem(
    REGISTERED_EVENTS_STORAGE_KEY,
  );

  if (!currentValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(currentValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function readJsonRecord<T>(storageKey: string) {
  const currentValue = window.localStorage.getItem(storageKey);

  if (!currentValue) {
    return {} as Record<string, T>;
  }

  try {
    const parsedValue = JSON.parse(currentValue);
    return isRecord(parsedValue) ? (parsedValue as Record<string, T>) : {};
  } catch {
    return {} as Record<string, T>;
  }
}

function saveRegistrationRecord(eventSlug: string, data: EventRegistrationData) {
  const registrations = readJsonRecord<EventRegistrationRecord[]>(
    EVENT_REGISTRATIONS_STORAGE_KEY,
  );
  const eventRegistrations = Array.isArray(registrations[eventSlug])
    ? registrations[eventSlug]
    : [];
  const participantKey =
    data.email.trim().toLowerCase() ||
    data.registration.trim().toLowerCase() ||
    data.name.trim().toLowerCase();
  const existingRecord = eventRegistrations.find((registration) => {
    const existingKey =
      registration.email.trim().toLowerCase() ||
      registration.registration.trim().toLowerCase() ||
      registration.name.trim().toLowerCase();

    return existingKey === participantKey;
  });
  const nextRecord: EventRegistrationRecord = {
    ...data,
    id: existingRecord?.id ?? `${eventSlug}-${Date.now()}`,
    eventSlug,
    registeredAt: existingRecord?.registeredAt ?? new Date().toISOString(),
  };
  const nextEventRegistrations = existingRecord
    ? eventRegistrations.map((registration) =>
        registration.id === existingRecord.id ? nextRecord : registration,
      )
    : [...eventRegistrations, nextRecord];

  window.localStorage.setItem(
    EVENT_REGISTRATIONS_STORAGE_KEY,
    JSON.stringify({
      ...registrations,
      [eventSlug]: nextEventRegistrations,
    }),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
