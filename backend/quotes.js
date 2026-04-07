export function getQuotes() {
  return {
    type: "quotes",
    data: [
      {
        title: "Policy #1",
        price: "$218/mo",
        tag: "Without endorsement"
      },
      {
        title: "Policy #2",
        price: "$256/mo",
        tag: "With endorsement"
      },
      {
        title: "Policy #3",
        price: "$272/mo",
        tag: "Best fit"
      }
    ]
  };
}