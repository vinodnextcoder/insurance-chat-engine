export function answerCoverage(question) {
  const q = question.toLowerCase();

  if (q.includes("landslide") || q.includes("foundation")) {
    return `Standard HO-3 covers dwelling and belongings.

Earth movement (like landslides or foundation shifts) is NOT covered.

You need an earth movement endorsement.`;
  }

  return "I can explain coverage, but I cannot recommend a policy.";
}