[
    // unwind the items to flatten structure
  {
    $unwind: "$items"
  },
  // calculate revenue (quantity*price)
  // change date to year-month
  {
    $addFields: {
      revenue: {
        $multiply: [
          "$items.quantity",
          "$items.price"
        ]
      },
      month: {
        $dateToString: {
          format: "%Y-%m",
          date: "$date"
        }
      }
    }
  },
  // again collect the data by grouping it via store name and month
  {
    $group: {
      _id: {
        store: "$store",
        month: "$month"
      },
      totalRevenue: { $sum: "$revenue" },
      totalQuantity: { $sum: "$items.quantity" },
      totalPriceQuantity: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
    }
  },
  // project required items,
  // calculate average prices
  {
    $project: {
      _id: 0,
      store: "$_id.store",
      month: "$_id.month",
      totalRevenue: 1,
      averagePrice: {
        $cond: {
          if: { $ne: ["$totalQuantity", 0] },
          then: { $divide: ["$totalPriceQuantity", "$totalQuantity"] },
          else: 0
        }
      }
    }
  },
  // sort by store and month
  {
    $sort: {
      store: 1,
      month: 1
    }
  }
]