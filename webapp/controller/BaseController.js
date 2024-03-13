/**
 * Base controller that contains methods used throughout the app
 * @namespace freestyle.app.controller.BaseController
 * @extends sap.ui.core.mvc.Controller
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("freestyle.app.controller.BaseController", {
        /**
		 * Sets the model for the view.
		 * @public
		 * @memberof freestyle.app.controller.BaseController
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
		 * @memberof freestyle.app.controller.BaseController
   		 * @returns {sap.ui.model.resource.ResourceModel} The resource bundle.
   		 */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    });
});