import Cookies from "js-cookie";

export const appConfig = {
  baseUrl: import.meta.env.VITE_API_URL,
  mediaAPI: import.meta.env.VITE_MEDIA_API_URL,
  mediaAPIKey: import.meta.env.VITE_MEDIA_API_KEY,
  mediaPath: import.meta.env.VITE_MEDIA_API_PATH,
  paymentsAPI: import.meta.env.VITE_PAYMENTS_API_PATH,
  paymentsAPIKey: import.meta.env.VITE_PAYMENTS_API_KEY,
  stripeKey: import.meta.env.VITE_STRIPE_KEY,
  appName: "POS Liquor",
  posDir: import.meta.env.VITE_POS_DIR || "pos",
  mapBoxToken: import.meta.env.VITE_MAPBOX_KEY,
  tokenName: "auth",
  dateApiTimeOfDayFormat: "HH:mm:ss",
  dateApiFormat: "YYYY-MM-DD",
  dateTimeApiFormat: "YYYY-MM-DDTHH:mm:ss",
  dateTimeWithTZFormat: "YYYY-MM-DDTHH:mm:ssZ",
  dateTimeOfDayFormat: "h:mm A",
  datePickerDateFormat: "MM/dd/yyyy",
  displayDateFormat: "MM/DD/YYYY",
  displayDateWithTimeFormat: "MM/DD/YYYY HH:mm",
  dateDayMonth: "ddd,  MMM D",
  domainName: "domain",
  version: import.meta.env.VITE_VERSION || "local",
  socketUrl: import.meta.env.VITE_SOCKET_URL,
  s3ReportBucketName: import.meta.env.VITE_S3_REPORT_BUCKET_NAME,
  serviceSocketApiUrl: import.meta.env.VITE_SERVICE_SOCKET_API_URL,

  setLocal: (key, value) => localStorage.setItem(key, value),
  getLocal: (key) => localStorage.getItem(key),
  setCookie: (key, value) => Cookies.set(key, value),
  getCookie: (key) => Cookies.get(key),

  getMediaKey: (
    oid, // org id
    pk, // primary item id
    suffix // any string suffix
  ) => {
    let key = `${appConfig.getCookie("domain")}/media/${oid}/`;
    if (pk) key += `${pk}/`;
    return `${key}${suffix || ""}`;
  },
};
