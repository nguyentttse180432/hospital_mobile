import * as React from "react";
import { NativeModules } from "react-native";

export const VnpayMerchantModule = NativeModules.VnpayMerchant;

// Đã loại bỏ interface ShowParam, chỉ dùng JSDoc cho params
/**
 * @param {Object} params
 * @param {boolean} [params.isSandbox]
 * @param {string} params.scheme
 * @param {string} [params.backAlert]
 * @param {string} [params.paymentUrl]
 * @param {string} [params.title]
 * @param {string} [params.titleColor]
 * @param {string} [params.beginColor]
 * @param {string} [params.endColor]
 * @param {string} [params.iconBackName]
 * @param {string} params.tmn_code
 */
const VNPMerchant = {
  show(params) {
    let _params = Object.assign(
      {
        isSandbox: true,
        paymentUrl: "https://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder",
        tmn_code: "FAHASA02",
        backAlert: "Bạn có chắc chắn trở lại ko?",
        title: "Thanh toán",
        iconBackName: "ion_back",
        beginColor: "#F06744",
        endColor: "#E26F2C",
        titleColor: "#E26F2C",
      },
      params
    );
    _params.titleColor = _params.titleColor?.replace(/#/g, "");
    _params.beginColor = _params.beginColor?.replace(/#/g, "");
    _params.endColor = _params.endColor?.replace(/#/g, "");
    VnpayMerchantModule.show(
      _params.scheme,
      _params.isSandbox,
      _params.paymentUrl,
      _params.tmn_code,
      _params.backAlert,
      _params.title,
      _params.titleColor,
      _params.beginColor,
      _params.endColor,
      _params.iconBackName
    );
  },
};
export default VNPMerchant;
