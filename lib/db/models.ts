import mongoose, { Schema } from "mongoose";

function userModel() {
  const schema = new Schema(
    {
      email: { type: String, unique: true, required: true },
      hash: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      balance: { type: String, required: true },
      level: { type: String, required: true },
      code: { type: String, required: true },
    },
    { timestamps: true, strict: false }
  );
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  return mongoose.models.User || mongoose.model("User", schema);
}

function ticketsModel() {
  const schema = new Schema(
    {
      fileName: String,
      name: String,
      payer: String,
      bookingCode: String,
      agent: String,
      agentId: { type: Schema.Types.ObjectId, required: false },
      agentCost: String,
      customerCost: String,
      paidByAgent: String,
      iata: String,
      ticketNumber: String,
      paymentMethod: String,
      paidAmount: String,
      receivingAmount1: String,
      receivingAmount1Date: String,
      receivingAmount2: String,
      receivingAmount2Date: String,
      receivingAmount2Method: String,
      receivingAmount3: String,
      receivingAmount3Date: String,
      receivingAmount3Method: String,
      cardNumber: String,
      bookedOn: String,
      travel1: String,
      travel2: String,
      dates: String,
      phone: String,
      flight: String,
      refund: String,
      refundUsed: String,
      supplied: String,
      refundDate: String,
      returned: String,
      returnedDate: String,
      desc: String,
    },
    { timestamps: true, strict: false }
  );
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  return mongoose.models.Tickets || mongoose.model("Tickets", schema);
}

function operationsModel() {
  const schema = new Schema(
    {
      transferName: String,
      transferAmountTotalOperation: String,
      refundAmountTotalOperation: String,
      ticketId: { type: Schema.Types.ObjectId, required: false },
      transferDate: String,
      operation: String,
      ticketRefundUsed: String,
      suppliedTicket: String,
    },
    { timestamps: true, strict: false }
  );
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  return mongoose.models.Operations || mongoose.model("Operations", schema);
}

function agentsOperationsModel() {
  const schema = new Schema(
    {
      transferName: String,
      agentId: { type: Schema.Types.ObjectId, required: false },
      method: String,
      totalOperation: String,
      balanceOperation: String,
      balanceOperationDelta: String,
      transferOperation: String,
      ticketId: { type: Schema.Types.ObjectId, required: false },
      transferDate: String,
      operation: String,
      suppliedTicket: String,
      suppliedTotal: String,
    },
    { timestamps: true, strict: false }
  );
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  return (
    mongoose.models.AgentsOperations ||
    mongoose.model("AgentsOperations", schema)
  );
}

function airlinesModel() {
  const schema = new Schema(
    {
      name: { type: String, required: true },
      desc: String,
      url: String,
      checkin: String,
      country: String,
      checkinTime: String,
    },
    { timestamps: true, strict: false }
  );
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  return mongoose.models.Airlines || mongoose.model("Airlines", schema);
}

function expensesModel() {
  const schema = new Schema(
    {
      title: String,
      desc: String,
      subcategory: String,
      category: String,
      type: String,
      paymentMethod: String,
      amount: String,
      paymentDate: String,
      status: String,
    },
    { timestamps: true, strict: false }
  );
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      delete ret._id;
      delete ret.hash;
    },
  });
  return mongoose.models.Expenses || mongoose.model("Expenses", schema);
}

export function getModels() {
  return {
    User: userModel(),
    Tickets: ticketsModel(),
    Operations: operationsModel(),
    AgentsOperations: agentsOperationsModel(),
    Airlines: airlinesModel(),
    Expenses: expensesModel(),
  };
}
