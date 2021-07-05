const u = new URL(window.location.href);
window.location.href = u.toString().replace(u.protocol, "https:");
