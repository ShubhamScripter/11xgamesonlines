// This script is intentionally tiny and "fire-and-forget".
// It prints a console line whenever password is changed via subAdminController.
//
// Usage:
//   node passwordChangeConsole.js <actorRole> <changedUserId> <changedUserName>

const actorRole = process.argv[2] ?? "unknown";
const changedUserId = process.argv[3] ?? "";
const changedUserName = process.argv[4] ?? "";

if (String(actorRole) === "superadmin") {
  console.log("role:superdamin");
} else {
  console.log(`role:${actorRole}`);
}

console.log(
  `password changed (userId=${changedUserId || "n/a"}, userName=${changedUserName || "n/a"})`
);

