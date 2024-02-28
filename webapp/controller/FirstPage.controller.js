sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("leverx.app.controller.FirstPage", {
		onHelloButtonPress: function () {
			MessageToast.show("Hello world once again!");
		}
	});
});
