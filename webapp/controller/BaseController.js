/**
 * Base controller that contains methods used throughout the app
 * @namespace aliaksandr.yemelyanau.products.managment.controller.BaseController
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
    ) {
    "use strict";

    return Controller.extend("aliaksandr.yemelyanau.products.managment.controller.BaseController", {
		/**
		 * Binds the view element to the specified path and sets the change event handler.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.BaseController
		 * @param {string} sPath - The path to bind the view element to.
		 */
        bindView: function (sPath) {
			this.getView().bindElement({
				path: sPath,
				events: {
					change: this._onBindingChange.bind(this)
				}
			});
		},

		/**
		 * Handles the change event of the view element binding.
		 * Checks if the bound context has a valid "id" property. If not, navigates to the "notFound" target.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.BaseController
		 */
        _onBindingChange : function () {
			const oView = this.getView();
			const oViewBinding = oView.getElementBinding();

			if (!oViewBinding.getBoundContext().getProperty("id")) {
				this.getRouter().getTargets().display("notFound");
				return;
			}
		},

        /**
		 * Retrieves the router associated with the controller.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.BaseController
		 * @returns {sap.ui.core.routing.Router} - The router for this component
		 */
        getRouter : function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
		 * Sets the model for the view.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.BaseController
		 * @param {sap.ui.model.Model} oModel - The model instance
		 * @param {string} sName - The model name
		 * @returns {sap.ui.mvc.View} - The view instance
		 */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
   		 * Retrieves the resource bundle for internationalization.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.BaseController
   		 * @returns {sap.ui.model.resource.ResourceModel} The resource bundle.
   		 */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    });
});