// export default class ProfitLossLayoutFields {
//     constructor({
//         Account,
//         AccountID,
//         AccountLevel0GroupName,
//         AccountLevel1GroupName,
//         AccountLevel2GroupName,
//         AccountName,
//         Direction,
//         GlobalRef,
//         Group,
//         ID,
//         IsAccount,
//         ISEmpty,
//         IsRoot,
//         KeyStringFieldName,
//         KeyValue,
//         LayoutID,
//         LayoutToUse,
//         Level,
//         Level0Order,
//         Level1Group,
//         Level1Order,
//         Level2Order,
//         Level3Order,
//         MsTimeStamp,
//         MsUpdateSiteCode,
//         Parent,
//         Pos,
//         Position,
//         Recno,
//         Steps,
//         Up
//     }) {
//       this.Account = Account;
//       this.AccountID = AccountID;
//       this.AccountLevel0GroupName = AccountLevel0GroupName;
//       this.AccountLevel1GroupName = AccountLevel1GroupName;
//       this.AccountLevel2GroupName = AccountLevel2GroupName;
//       this.AccountName = AccountName;
//       this.Direction = Direction;
//       this.GlobalRef = GlobalRef;
//       this.Group = Group;
//       this.ID = ID;
//       this.IsAccount = IsAccount;
//       this.ISEmpty = ISEmpty;
//       this.IsRoot = IsRoot;
//       this.KeyStringFieldName = KeyStringFieldName;
//       this.KeyValue = KeyValue;
//       this.LayoutID = LayoutID;
//       this.LayoutToUse = LayoutToUse;
//       this.Level = Level;
//       this.Level1Group = Level1Group;
//       this.Level0Order = Level0Order;
//       this.Level1Order = Level1Order;
//       this.Level2Order = Level2Order;
//       this.Level3Order = Level3Order;
//       this.MsTimeStamp = MsTimeStamp;
//       this.MsUpdateSiteCode = MsUpdateSiteCode;
//       this.Parent = Parent;
//       this.Pos = Pos;
//       this.Position = Position;
//       this.Recno = Recno;
//       this.Steps = Steps;
//       this.Up = Up;
//     }
//   }

export default class ProfitLossLayoutFields {
  constructor(fields) {
    this.Account_Type = fields["Account Type"];
    this.Level0Order = fields["AccountHeaderOrder"];
    this.AccountHeaderOrder = fields["AccountHeaderOrder"];
    this.AccountID = fields["AccountID"];
    this.AccountName = fields["AccountName"];
    this.AccountNo = fields["AccountNo"];
    this.Level1Order = fields["AccountSub1Order"];
    this.Level2Order = fields["AccountSub2Order"];
    this.Level3Order = fields["AccountSub3Order"];
    this.AccountType = fields["AccountType"];
    this.Default_AmountColumnEx = fields["Default_AmountColumnEx"];
    this.Default_AmountColumnInc = fields["Default_AmountColumnInc"];
    this.FinalOrder = fields["FinalOrder"];
    this.HideTotal = fields["HideTotal"];
    this.IsRoot = fields["IsRoot"];
    this.Level1 = fields["Level1"];
    this.SubTotalEx = fields["SubTotalEx"];
    this.SubTotalInc = fields["SubTotalInc"];
    this.TotalAmountEx = fields["TotalAmountEx"];
    this.TotalAmountInc = fields["TotalAmountInc"];
    this.Seqno = fields["seqno"];
  }
}