module.exports = (req, res, next) => {
  const text = JSON.stringify(req.body);

  const blockedWords = ["guaranteed", "100% safe"];

  for (let word of blockedWords) {
    if (text.includes(word)) {
      return res.status(400).json({
        error: "Compliance violation detected"
      });
    }
  }

  next();
};