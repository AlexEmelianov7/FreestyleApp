/**
 * Controller for managing NotFound view.
 * @namespace aliaksandr.yemelyanau.products.managment.controller.NotFound
 * @extends aliaksandr.yemelyanau.products.managment.controller.BaseController
 */
sap.ui.define([
	"aliaksandr/yemelyanau/products/managment/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("aliaksandr.yemelyanau.products.managment.controller.NotFound", {
		/**
		 * Navigates to the Products Overview page.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.NotFound
		 */
		onNavToProductsOverview: function () {
			this.getRouter().navTo("ProductsOverview");
		}
	});
});