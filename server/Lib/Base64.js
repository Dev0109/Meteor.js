import { Buffer } from 'buffer';

export default class Base64 {
  static encode(string = "JavaScript") {
    return Buffer.from(string).toString("base64");
  }

  static decode(string) {
    return Buffer.from(string, "base64").toString();
  }
}