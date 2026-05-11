(() => {
  const language = "es-ES";
  const languages = Object.freeze(["es-ES", "es", "en"]);
  const timeZone = "Europe/Madrid";
  const madrid = Object.freeze({
    accuracy: 25,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 40.4168,
    longitude: -3.7038,
    speed: null,
  });

  const defineGetter = (target, property, value) => {
    try {
      Object.defineProperty(target, property, {
        configurable: true,
        get: () => value,
      });
    } catch {
      // Ignore locked browser properties.
    }
  };

  defineGetter(Navigator.prototype, "language", language);
  defineGetter(Navigator.prototype, "languages", languages);

  const originalDateTimeFormat = Intl.DateTimeFormat;
  Intl.DateTimeFormat = function dateTimeFormat(locales, options = {}) {
    return new originalDateTimeFormat(locales ?? language, {
      timeZone,
      ...options,
    });
  };
  Intl.DateTimeFormat.prototype = originalDateTimeFormat.prototype;
  Object.setPrototypeOf(Intl.DateTimeFormat, originalDateTimeFormat);
  Intl.DateTimeFormat.supportedLocalesOf = originalDateTimeFormat.supportedLocalesOf.bind(originalDateTimeFormat);

  if (!navigator.geolocation) {
    return;
  }

  const buildPosition = () => ({
    coords: madrid,
    timestamp: Date.now(),
  });

  navigator.geolocation.getCurrentPosition = (success) => {
    queueMicrotask(() => success(buildPosition()));
  };

  navigator.geolocation.watchPosition = (success) => {
    const watchId = setTimeout(() => success(buildPosition()), 0);
    return Number(watchId);
  };

  navigator.geolocation.clearWatch = (watchId) => {
    clearTimeout(watchId);
  };
})();
