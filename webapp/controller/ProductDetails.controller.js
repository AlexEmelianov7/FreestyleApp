/**
 * Controller for managing Product Details view.
 * @namespace aliaksandr.yemelyanau.products.managment.controller.ProductDetails
 * @extends aliaksandr.yemelyanau.products.managment.controller.BaseController
 */
sap.ui.define([
	"aliaksandr/yemelyanau/products/managment/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "aliaksandr/yemelyanau/products/managment/model/constants",
    "aliaksandr/yemelyanau/products/managment/model/formatter",
    "sap/ui/core/library",
    "sap/m/MessageBox",
    "sap/ui/core/Messaging",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/ui/core/message/Message"
], function(
	BaseController,
    JSONModel,
    constants,
    formatter,
    coreLibrary,
    MessageBox,
    Messaging,
    MessagePopover,
    MessageItem,
    Message
) {
	"use strict";

	return BaseController.extend("aliaksandr.yemelyanau.products.managment.controller.ProductDetails", {
        formatter: formatter,

        /**
         * Initializes the ProductDetails controller.
         * This function is responsible for setting up the initial state of the controller by creating and binding models,
         * attaching event listeners, and initializing messaging functionality.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         */
        onInit: function() {
             // Create and set the view model for the product details view
            const oViewModel = new JSONModel({
                viewMode: {
                    create: false,
                    edit: false
                }
            });
            this.setModel(oViewModel, "productDetailsView");

            // Create and set the model for new product data
            const oNewProductModel = new JSONModel({
                id: "",
                name: "",
                category: "",
                price: "",
                status: "",
                description: "",
                country: "",
                date: formatter.formatDate(new Date()),
                manufacturer: "",
                barcode: "",
                quantity: 0
            });
            this.setModel(oNewProductModel, "newProduct");

            // Attach event listeners for route pattern matches
            this.getRouter().getRoute("ProductDetails").attachPatternMatched(this._onPatternMatched, this);
            this.getRouter().getRoute("NewProduct").attachPatternMatched(this._onPatternMatched, this);

            // Register the view for Messaging functionality. Set the message model for message handling
            Messaging.registerObject(this.getView(), true);
            this.setModel(Messaging.getMessageModel(), "messages");

            // Create the message popover for displaying messages
            this._createMessagePopover();
        },

        /**
         * Handles the "patternMatched" event for the ProductDetails controller.
         * This function is triggered when a route pattern is matched and is responsible for updating the view
         * and handling navigation based on the matched route.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event object containing information about the matched route.
         */
        _onPatternMatched: function(oEvent) {
            const sRouteName = oEvent.getParameter("name");
            const oViewModel = this.getView().getModel("productDetailsView");

            if (sRouteName === "NewProduct") {
                oViewModel.setProperty("/viewMode/create", true);
                oViewModel.setProperty("/viewMode/edit", false);
                this._clearProductCreationFields();
            } else {
                oViewModel.setProperty("/viewMode/edit", false);
                oViewModel.setProperty("/viewMode/create", false);
                const oModel = this.getView().getModel();
                const sProductId = oEvent.getParameter("arguments").productId;

                oModel.dataLoaded().then(() => {
                    const aProducts = oModel.getProperty("/products");
                    const oNavigatedProductIndex = aProducts.findIndex(oProduct => oProduct.id === sProductId);
                    const sProductPath = `/products/${oNavigatedProductIndex}`; 
                    this.bindView(sProductPath);
			    });	
            }

            Messaging.removeAllMessages();
        },

        /**
         * Navigates to the ProductsOverview route.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         */
        onNavToProductsOverview: function() {
            this.getRouter().navTo("ProductsOverview");
        },

        /**
         * Deletes the currently selected product from the model.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         */
		_deleteProduct: function() {
            const sDeletedProductId = this.getView().getBindingContext().getProperty("id");
			const aProducts = this.getView().getModel().getProperty("/products");
			const aUpdatedProducts = aProducts.filter(oProduct => oProduct.id !== sDeletedProductId);

			this.getView().getModel().setProperty("/products", aUpdatedProducts);
		},

        /**
         * Handles the press event of the delete product button.
         * Prompts a confirmation dialog to delete the product and performs the deletion if confirmed.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         */
        onDeleteProductPress: function() {
            const sDeletedProductName = this.getView().getBindingContext().getProperty("name");
			const sConfirmationMessage = this.getResourceBundle().getText("msgDeleteProduct", sDeletedProductName);

			MessageBox.confirm(sConfirmationMessage, {
				title: this.getResourceBundle().getText("ttlConfirmDeletion"),
				actions: [
					MessageBox.Action.OK,
					MessageBox.Action.CANCEL
				],
				emphasizedAction: MessageBox.Action.OK,
				initialFocus: null,
				onClose: (oAction) => {
					if (oAction === MessageBox.Action.OK) {		
						this._deleteProduct();
                        this.onNavToProductsOverview();
					}
				}
			})
        },

        /**
         * Retrieves the controls that require validation for the product creation.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @returns {sap.ui.core.Control[]} An array of controls that require validation for the product creation.
         */
        _getControlsForValidation: function() {
            const oView = this.getView(),
                  aControlsForValidation = [
                        oView.byId("iName"),
                        oView.byId("siPrice"),
                        oView.byId("sProductCategories"),
                        oView.byId("sProductStatuses")
                    ];

            if (oView.byId("siQuantity").getParent().getVisible()) {
                aControlsForValidation.push(oView.byId("siQuantity"));
            }        
                    
            return aControlsForValidation;
        },

        /**
         * Clears the fields in the product creation form and resets the value states of the validation controls.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @returns {void}
         */
        _clearProductCreationFields: function () {
            const oNewProductModel = this.getView().getModel("newProduct");
            const oNewProductFields = oNewProductModel.getProperty("/");

            Object.keys(oNewProductFields).forEach((sKey) => {
                if (sKey !== "date") {
                    oNewProductModel.setProperty("/" + sKey, "");
                }      
            });

            oNewProductModel.updateBindings(true);

			const aControlsForValidation = this._getControlsForValidation();
			aControlsForValidation
				.filter(oControl => oControl.getValueState() === coreLibrary.ValueState.Error)
				.forEach(oControl => oControl.setValueState(coreLibrary.ValueState.None));
		},

        /**
         * Generates a new product ID.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @returns {string} The generated new product ID.
         */
        _generateNewProductId: function() {
            const iRandomNum = Math.floor(Math.random() * 100000);
            const iPaddedNum = String(iRandomNum).padStart(5, "0");
            return iPaddedNum;
        },

        /**
         * Saves the new product to the model and navigates to the details of the newly created product.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {Object} oNewProduct - The new product object.
         * @param {sap.ui.model.Model} oNewProductModel - The model for the new product.
         * @param {sap.ui.model.Model} oModel - The main model.
         */
        _saveNewProduct: function(oNewProduct, oNewProductModel, oModel) {
            const aProducts = oModel.getProperty("/products");
            
            oNewProductModel.setProperty("/id", this._generateNewProductId());
            const oNewProductCopy = Object.assign({}, oNewProduct);

            aProducts.push(oNewProductCopy);
            oModel.setProperty("/products", aProducts);
    
            const sNewProductId = oNewProductModel.getProperty("/id");
            this.getRouter().navTo("ProductDetails", {
                productId: sNewProductId
            });
        },

        /**
         * Saves the edited product to the model.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event that triggered the save action.
         * @param {Object} oNewProduct - The edited product object.
         * @param {sap.ui.model.Model} oModel - The main model.
         */
        _saveEditedProduct: function(oEvent, oNewProduct, oModel) {
            const oViewModel = this.getView().getModel("productDetailsView");
            const sPath = oEvent.getSource().getBindingContext().sPath;
            const oEditedProductCopy = Object.assign({}, oNewProduct);
            oModel.setProperty(sPath, oEditedProductCopy);
            oViewModel.setProperty("/viewMode/create", false);
        },

        /**
         * Opens the message popover and sets the visibility of the message popover button.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @returns {void}
         */
        _openMessagePopover: function() {
            const oMessagePopoverButton = this.byId("btnMessagePopover");
            oMessagePopoverButton.setVisible(true);

            this.oMessagePopover.getBinding("items").attachChange(() => {
                this.oMessagePopover.navigateBack();
            });

            setTimeout(() => {
                this.oMessagePopover.openBy(oMessagePopoverButton);
            }, 100);
        },

        /**
         * Handles the press event of the save product button.
         * Performs validation on the required fields, opens the message popover if there are validation errors,
         * and saves the product either as a new product or an edited product.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event object.
         */
        onSaveProductPress: function(oEvent) {
            const oModel = this.getView().getModel();
            const oNewProductModel = this.getView().getModel("newProduct");
            const oNewProduct = oNewProductModel.getProperty("/");

            const oViewModel = this.getView().getModel("productDetailsView");
            const bIsEditMode = oViewModel.getProperty("/viewMode/edit");

            const aControlsForValidation = this._getControlsForValidation();
            aControlsForValidation.forEach(oControl => {
                this._validateRequiredFields(oControl);
            })

            const aValidationMessages = Messaging.getMessageModel().getData();

            if (aValidationMessages.length) {
                this._openMessagePopover();
            } else if (bIsEditMode) {
                this._saveEditedProduct(oEvent, oNewProduct, oModel);
            } else {
                this._saveNewProduct(oNewProduct, oNewProductModel, oModel);
            }
        },

        /**
         * Handles the press event of the cancel create product button.
         * Navigates to the products overview page if not in edit mode, otherwise cancels the create mode and clears any validation messages.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         */
        onCancelCreateProductPress: function() {
            const oViewModel = this.getView().getModel("productDetailsView");
            const bIsEditMode = oViewModel.getProperty("/viewMode/edit");
            const aValidationMessages = Messaging.getMessageModel().getData();

            if (!bIsEditMode) {
                this.onNavToProductsOverview();
                return;
            }
            
            oViewModel.setProperty("/viewMode/create", false);
            
            if (aValidationMessages.length) {
                this.getView().getModel("newProduct").updateBindings(true);
                Messaging.removeAllMessages();
            }
        },

        /**
         * Clears the quantity message and resets the quantity input value to 0 if the product status is 'Out of Stock'.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {string} sStatus - The product status.
         */
        _clearQuantityMessage: function(sStatus) {
            const sQuantityInput = this.byId("siQuantity");

            if (sStatus === constants.OUT_OF_STOCK_STATUS) {
                sQuantityInput.setValue(0);
                const oQuantityInputTarget = sQuantityInput.getBindingPath("value");
                this._removeMessageFromTarget(oQuantityInputTarget);
            }
        },

        /**
         * Sets the value of the Select controls based on the selected item and updates the new product model accordingly.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event object.
         */
        _setSelectsValue: function(oEvent) {
            const sSelectedItemText = oEvent.getParameter("selectedItem").getText();
            const oNewProductModel = this.getView().getModel("newProduct");
            const sSelectedKeyPath = oEvent.getSource().getBindingPath("selectedKey");
            const sStatus = oNewProductModel.getProperty("/status");
            

            if (sSelectedKeyPath === "/category") {
                oNewProductModel.setProperty("/category", sSelectedItemText);
            } else {
                oNewProductModel.setProperty("/status", sSelectedItemText);
            }

            this._clearQuantityMessage(sStatus);
        },

        /**
         * Handles the live change event of a control.
         * Validates required fields, opens the message popover if there are validation messages,
         * and sets the selects value if the control is a Select control.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event object.
         */
        onControlLiveChange: function(oEvent) {
            const oControl = oEvent.getSource();

            this._validateRequiredFields(oControl);
            const aValidationMessages = Messaging.getMessageModel().getData();

            if (aValidationMessages.length) {
                this._openMessagePopover();
            }

            if (oControl.isA("sap.m.Select")) {
                this._setSelectsValue(oEvent);
            }
        },

        /**
         * Handles the press event of the edit product button.
         * Sets the view mode to edit and create, and copies the edited product to the new product model.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event object.
         * @returns {void}
         */
        onEditProductPress: function(oEvent) {
            const oViewModel = this.getView().getModel("productDetailsView");
            oViewModel.setProperty("/viewMode/edit", true);
            oViewModel.setProperty("/viewMode/create", true);

            const oEditedProduct = oEvent.getSource().getBindingContext().getProperty();
            const oEditedProductCopy = Object.assign({}, oEditedProduct);
            const oNewProductModel = this.getView().getModel("newProduct");
            oNewProductModel.setProperty("/", oEditedProductCopy);
        },
		
        /**
         * Creates the message popover and adds it as a dependent to the button.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         */
        _createMessagePopover: function() {
            this.oMessagePopover = new MessagePopover({
				items: {
					path:"messages>/",
					template: new MessageItem(
						{
						    title: "{messages>message}",
							subtitle: "{messages>additionalText}",
							type: "{messages>type}",
							description: "{messages>message}"
						})
				}
            });

            this.byId("btnMessagePopover").addDependent(this.oMessagePopover);
        },

        /**
         * Handles the press event of the message popover button.
         * Creates the message popover if it doesn't exist and toggles its visibility.
         * @public
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.base.Event} oEvent - The event object.
         */
        onMessagePopoverPress: function (oEvent) {
			if (!this.oMessagePopover) {
				this._createMessagePopover();
			}
			this.oMessagePopover.toggle(oEvent.getSource());
		},

        /**
         * Removes messages from the target in the messaging model.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {string} sTarget - The target of the message.
         */
        _removeMessageFromTarget: function (sTarget) {
			Messaging.getMessageModel().getData().forEach(oMessage => {
				if (oMessage.target === sTarget) {
				    Messaging.removeMessages(oMessage);
				}
			});
		},

        /**
         * Validates required fields of a control.
         * Removes messages from the target, checks if the control is empty,
         * and adds an error message to the messaging model if it's empty.
         * @private
         * @memberof aliaksandr.yemelyanau.controller.ProductDetails
         * @param {sap.ui.core.Control} oControl - The control to validate.
         */
        _validateRequiredFields: function (oControl) {
            const sTarget = oControl.getBindingPath("value") || oControl.getBindingPath("selectedKey");
			this._removeMessageFromTarget(sTarget);

            let bIsEmpty = false;

            oControl.isA("sap.m.Select") 
            ? bIsEmpty = !oControl.getSelectedItem() 
            : bIsEmpty = !oControl.getValue(); 
            
			if (bIsEmpty) {
				Messaging.addMessages(
					new Message({
						message: this.getResourceBundle().getText("errEmptyField"),
						type: coreLibrary.MessageType.Error,
						additionalText: oControl.getParent().getLabel(),
                        target: sTarget,
						processor: this.getView().getModel("newProduct")
					})
				);
			}
		}
	});
});