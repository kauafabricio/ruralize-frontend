export type EventRegistrationData = {
  name: string;
  email: string;
  registration: string;
  course: string;
  phone: string;
  motivation: string;
  consent: boolean;
};

const FORM_STORAGE_KEY = "ruralize.eventRegistrationForms";
const REGISTERED_EVENTS_STORAGE_KEY = "ruralize.registeredEvents";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
