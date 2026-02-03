const { Timestamp } = require("firebase-admin/firestore");

function todayString() {
    return new Date().toISOString().split("T")[0];
}
function todayISO() {
    return new Date().toISOString();
}
function dateString(date = new Date()) {
    return date.toISOString().split("T")[0];
}
function daysAgo(n = 1) {
    const startThis = new Date();
    startThis.setDate(new Date().getDate() - n);
    return startThis.toISOString();
}
function daysAgoDate(n = 1) {
    const startThis = new Date();
    startThis.setDate(new Date().getDate() - n);
    return startThis.toISOString().split("T")[0];
}
function daysAgoTS(n = 1) {
    const startThis = new Date();
    startThis.setDate(new Date().getDate() - n);
    return Timestamp.fromDate(startThis);
}
function normalizeDate(date) {
    const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return normalized;
  }
module.exports = { todayString, daysAgo, todayISO, daysAgoTS, normalizeDate, dateString, daysAgoDate };