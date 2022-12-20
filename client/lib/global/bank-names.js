export const BankNameList = [
    ['CBA', 'Commonwealth Bank'],
    ['NAB', 'National Australian Bank'],
    ['WBC', 'Westpac Bank'],
    ['MQG', 'Macquarie Bank'],
    ['ANZ', 'Australia and New Zealand Banking Group'],
    ['BEN', 'Bendigo Bank'],
    ['BOQ', 'Bank of Queensland'],
    ['VUK', 'Virgin Money'],
    ['BFL', 'BSP Financial Group'],
    ['JDO', 'Judo Bank']
];

let bankNameObjList = [];
for (let i = 0; i < BankNameList.length; i++) {
    bankNameObjList.push({name: BankNameList[i][0], description: BankNameList[i][1]});
}

export const bankNameList = bankNameObjList;