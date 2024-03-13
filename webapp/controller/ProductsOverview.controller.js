/**
 * Controller for managing Products Overview view.
 * @namespace aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
 * @extends aliaksandr.yemelyanau.products.managment.controller.BaseController
 */
sap.ui.define([
	"aliaksandr/yemelyanau/products/managment/controller/BaseController",
	"aliaksandr/yemelyanau/products/managment/model/constants",
	"aliaksandr/yemelyanau/products/managment/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/Token",
	"sap/ui/comp/smartvariants/PersonalizableInfo",
	"sap/ui/model/type/Float",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/SortController",
	"sap/m/p13n/GroupController",
	"sap/m/p13n/MetadataHelper",
	"sap/m/table/ColumnWidthController",
	"sap/ui/core/library",
	"sap/m/ColumnListItem",
	"sap/ui/model/Sorter",
	"sap/m/Text",
	"sap/m/ObjectIdentifier",
	"sap/m/ObjectNumber",
	"sap/m/MessageBox"
], function (
	BaseController,
	constants,
	formatter,
	JSONModel,
	Filter,
	FilterOperator,
	Fragment,
	Token,
	PersonalizableInfo,
	TypeFloat,
	Engine,
	SelectionController,
	SortController,
	GroupController,
	MetadataHelper,
	ColumnWidthController,
	coreLibrary,
	ColumnListItem,
	Sorter,
	Text,
	ObjectIdentifier,
	ObjectNumber,
	MessageBox
) {
	"use strict";

	return BaseController.extend("aliaksandr.yemelyanau.products.managment.controller.ProductsOverview", {
		/**
		 * Initializes the ProductsOverview controller.
		 * Creates and sets the view model for the productsOverview view.
		 * Loads the data from the localData.json file and sets it as the model for the controller.
		 * Creates a view model for the ProductsOverview.
		 * Registers the controller for Products table p13n (personalization) events.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onInit: function() {
			const oViewModel = new JSONModel({
				productsTableTitle: this.getResourceBundle().getText("ttlNoData"),
				deleteBtnEnabled: false
			})
			this.setModel(oViewModel, "productsOverview");

			this.oFilterBar = this.getView().byId("filterBar");
			this.oTable = this.getView().byId("productsTable");

			this._registerForP13n();
		},

		/**
		 * Handles the filter change event.
		 * Sets the products table overlay.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onFilterChange: function() {
			this._setProductsTableOverlay();
		},

		/**
		 * Handles the after variant load event.
		 * Sets the products table overlay.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onAfterVariantLoad: function () {
			this._setProductsTableOverlay();
		},

		/**
		 * Sets the products table overlay.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		_setProductsTableOverlay: function () {
			this.oTable.setShowOverlay(true);
		},

		/**
		 * Handles the selection change event.
		 * Fires the filter change event on the filter bar.
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The event object.
		 * @returns {void}
		 */
		onSelectionChange: function (oEvent) {
			this.oFilterBar.fireFilterChange(oEvent);
		},

		/**
		 * Handles the update finished event of the products table.
		 * Updates the title of the products table based on the total number of items.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The update finished event object.
		 */
		onProductsTableUpdateFinished: function(oEvent) {
			let sTitle;
			const oTable = oEvent.getSource();
			const iTotalItems = oEvent.getParameter("total");
		
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("ttlProductsTableCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("ttlNoData");
			}
			this.getView().getModel("productsOverview").setProperty("/productsTableTitle", sTitle);
		},

		/**
		 * Opens the PriceValueHelpDialog.
		 * Loads the PriceValueHelpDialog fragment and sets up the dialog with range key fields.
		 * Sets the tokens from the price multi-input control and opens the dialog.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onOpenPriceValueHelpDialog: function() {
			this._oPriceMultiInput = this.byId("miPrice");

			this.loadFragment({
				name: "aliaksandr.yemelyanau.products.managment.view.fragment.PriceValueHelpDialog"
			}).then(function(oPriceValueHelpDialog) {
				this._oPriceValueHelpDialog = oPriceValueHelpDialog;
				oPriceValueHelpDialog.setRangeKeyFields([{
					label: constants.PRICE_COL_LABEL,
					key: "id",
					type: "float",
					typeInstance: new TypeFloat({}, {
						minimum: 1
					})
				}]);

				oPriceValueHelpDialog.setTokens(this._oPriceMultiInput.getTokens());
				oPriceValueHelpDialog.open();
			}.bind(this));
		},

		/**
		 * Handles the press event of the OK button in the PriceValueHelpDialog.
		 * Sets the tokens from the PriceValueHelpDialog to the price multi-input control and closes the dialog.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The press event object.
		 */
		onPriceValueHelpDialogOkPress: function(oEvent) {
			const aTokens = oEvent.getParameter("tokens");
			this._oPriceMultiInput.setTokens(aTokens);
			this._oPriceValueHelpDialog.close();
		},

		/**
		 * Handles the press event of the Cancel button in the PriceValueHelpDialog.
		 * Closes the PriceValueHelpDialog.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onPriceValueHelpDialogCancelPress: function () {
			this._oPriceValueHelpDialog.close();
		},

		/**
		 * Handles the after close event of the PriceValueHelpDialog.
		 * Destroys the PriceValueHelpDialog instance.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onPriceValueHelpDialogAfterClose: function () {
			this._oPriceValueHelpDialog.destroy();
		},

		/**
		 * Opens the CountrySelectDialog.
		 * Loads the CountrySelectDialog fragment and sets up the dialog with filtering based on the input value.
		 * Opens the dialog with the provided input value.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The event object that triggered the method.
		 */
		onOpenCountrySelectDialog: function(oEvent) {
			const sInputValue = oEvent.getSource().getValue();

			if (!this._pSelectDialog) {
				this._pSelectDialog = Fragment.load({
					id: this.getView().getId(),
					name: "aliaksandr.yemelyanau.products.managment.view.fragment.CountrySelectDialog",
					controller: this
				}).then(oSelectDialog => {
					this.getView().addDependent(oSelectDialog);
					return oSelectDialog;
				});
			}

			this._pSelectDialog.then(oSelectDialog => {
				oSelectDialog.getBinding("items").filter([new Filter(
					"country",
					FilterOperator.Contains,
					sInputValue
				)]);
				
				oSelectDialog.open(sInputValue);
			});
		},

		/**
		 * Handles the search event of the CountrySelectDialog.
		 * Filters the items in the dialog based on the search value.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The search event object.
		 */
		onCountrySelectDialogSearch: function(oEvent) {
			const sValue = oEvent.getParameter("value");
			const oFilter = new Filter(
				"country",
				FilterOperator.Contains,
				sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		/**
		 * Handles the cancel and confirm evens of the CountrySelectDialog.
		 * Adds the selected items as tokens to the multi-input control.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The close event object.
		 */
		onCountrySelectDialogClose: function(oEvent) {
			const aSelectedItems = oEvent.getParameter("selectedItems"),
				  oMultiInput = this.byId("miCountries");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(oItem => {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		},

		/**
		 * Retrieves the selected filter items from the provided FilterGroupItem.
		 * Based on the type of control in the FilterGroupItem, different selection values are obtained.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterGroupItem - The FilterGroupItem containing the selection control.
		 * @returns {Array} - The selected filter items.
		 */
		_getSelectionControlsFilterItems: function(oFilterGroupItem) {
			const oControl = oFilterGroupItem.getControl();
			const sControlName = oControl.getMetadata().getName();
			let aFilterItems = [];
		  
			switch (sControlName) {
				case "sap.m.MultiComboBox":
					aFilterItems = oControl.getSelectedItems();
					break;
			  	case "sap.m.DateRangeSelection":
					const oDateFrom = oControl.getDateValue();
					const oDateTo = oControl.getSecondDateValue();
					if (oDateFrom && oDateTo) {
				  		aFilterItems.push({
							dateFrom: oDateFrom,
							dateTo: oDateTo,
							isDateRange: true
				  		});
					}
				break;
			  	case "sap.m.Input":
					aFilterItems.push(oControl.getValue());
					break;
			  default:
					aFilterItems = oControl.getTokens();
					break;
			}
		  
			return aFilterItems;
		},

		/**
		 * Transforms the selected filter items into an array of filters.
		 * Based on the type of filter item, different filters are created.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aFilterItems - The selected filter items.
		 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterGroupItem - The filter group item associated with the filter items.
		 * @returns {Array} - The array of filters.
		 */
		_getFilterBarFilters: function(aFilterItems, oFilterGroupItem) {
			const aFilters = aFilterItems.map(oFilterItem => {
				switch (true) {
					case oFilterItem.isDateRange:
						return new Filter({
							path: oFilterGroupItem.getName(),
					  		operator: FilterOperator.BT,
					  		value1: formatter.formatDate(oFilterItem.dateFrom),
					  		value2: formatter.formatDate(oFilterItem.dateTo)
					});
				  	case typeof oFilterItem === "object" && oFilterItem.data().hasOwnProperty("range"):
						const sSelectedItemValue = oFilterItem.data("range").value1;
						const sSelectedItemSecondValue = oFilterItem.data("range").value2;
						return new Filter({
					  		path: oFilterGroupItem.getName(),
					  		operator: FilterOperator[oFilterItem.data("range").operation],
					  		value1: sSelectedItemValue.toString(),
					  		value2: sSelectedItemSecondValue ? sSelectedItemSecondValue.toString() : null
						});
				  	default:
						return new Filter({
							path: oFilterGroupItem.getName(),
							operator: FilterOperator.Contains,
							value1: typeof oFilterItem !== "object" ? oFilterItem : oFilterItem.getText()
						});
				}
			});
			
			return aFilters;
		},

		/**
		 * Handles the apply filters action.
		 * Retrieves the selected filter items for each filter group item and creates an array of filters.
		 * Filters the table binding with the created filters.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onApplyFilters: function() {
			this.aTableFilters = this.oFilterBar.getFilterGroupItems().reduce((aResult, oFilterGroupItem) => {
				const aFilterItems = this._getSelectionControlsFilterItems(oFilterGroupItem);

				if (aFilterItems.length) {
					const aFilters = this._getFilterBarFilters(aFilterItems, oFilterGroupItem)
					aResult.push(new Filter({
						filters: aFilters,
						and: false
					}));
				}

				return aResult;
			}, []);

			this.oTable.getBinding("items").filter(this.aTableFilters);
			this.oTable.setShowOverlay(false);
		},

		/**
		 * Registers the products table for personalization (p13n).
		 * Creates and initializes the metadata helper and registers the table with the p13n engine.
		 * Attaches a state change event listener to the p13n engine.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		_registerForP13n: function() {
			this.oMetadataHelper = new MetadataHelper([
				{key: constants.NAME_COL_ID, label: constants.NAME_COL_LABEL, path: constants.NAME_PATH},
				{key: constants.CATEGORY_COL_ID, label: constants.CATEGORY_COL_LABEL, path: constants.CATEGORY_PATH},
				{key: constants.DESCRIPTION_COL_ID, label: constants.DESCRIPTION_COL_LABEL, path: constants.DESCRIPTION_PATH},
				{key: constants.PRICE_COL_ID, label: constants.PRICE_COL_LABEL, path: constants.PRICE_PATH},
				{key: constants.COUNTRY_COL_ID, label: constants.COUNTRY_COL_LABEL, path: constants.COUNTRY_PATH},
				{key: constants.CREATED_COL_ID, label: constants.CREATED_COL_LABEL, path: constants.CREATED_PATH},
			]);

			Engine.getInstance().register(this.oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Columns: new SelectionController({
						targetAggregation: "columns",
						control: this.oTable
					}),
					Sorter: new SortController({
						control: this.oTable
					}),
					Groups: new GroupController({
						control: this.oTable
					}),
					ColumnWidth: new ColumnWidthController({
						control: this.oTable
					})
				}
			});

			Engine.getInstance().attachStateChange(this._onProductsTableStateChange.bind(this));
		},

		/**
		 * Transforms the Sorter and Group state into an array of Sorter instances.
		 * Constructs and returns an array of Sorter instances based on the provided sorter and group state.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aSorter - The sorter state array.
		 * @param {Array} aGroups - The group state array.
		 * @returns {Array} - The array of Sorter instances.
		 */
		_getProductsTableSorters: function(aSorter, aGroups) {
			const aSorters = [];
  
			aGroups.forEach(oGroup => {
				const sPath = this.oMetadataHelper.getProperty(oGroup.key).path;
				aSorters.push(new Sorter(sPath, false, true));
			});
			
			aSorter.forEach(oSorter => {
				const sPath = this.oMetadataHelper.getProperty(oSorter.key).path;
				const oExistingSorter = aSorters.find(oSort => oSort.sPath === sPath);
				
				if (oExistingSorter) {
					oExistingSorter.bDescending = !!oSorter.descending;
				} else {
					aSorters.push(new Sorter(sPath, oSorter.descending));
				}
			});
			
			return aSorters;
		},

		/**
		 * Sets the sort indicators on the table columns based on the provided sorters.
		 * Sets the sort indicator on each table column based on the corresponding sorter in the provided sorters array.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aSorters - The array of Sorter instances.
		 */
		_setProductsTableSortIndicators: function(aSorters) {
			aSorters.forEach(oSorter => {
				const oColumn = this.byId(oSorter.key);
				
				if (oSorter.sorted !== false) {
					oColumn.setSortIndicator(
						oSorter.descending 
						? coreLibrary.SortOrder.Descending 
						: coreLibrary.SortOrder.Ascending
					);
				}
			});
		},

		/**
		 * Sets the grouping state on the table columns based on the provided groups.
		 * Sets the "grouped" attribute on each table column based on the corresponding group in the provided groups array.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aGroups - The group state array.
		 */
		_setProductsTableGroups: function(aGroups) {
			aGroups.forEach(oSorter => {
				const oColumn = this.byId(oSorter.key);
				oColumn.data("grouped", true);
			});
		},

		/**
		 * Sets the visibility and order of the table columns based on the provided columns state.
		 * Sets the visibility and order of the table columns based on the corresponding column state in the provided columns array.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aColumns - The columns state array.
		 */
		_setProductsTableColumns: function(aColumns) {
			aColumns.forEach((oProp, iIndex) => {
				const oColumn = this.byId(oProp.key);
				oColumn.setVisible(true);
			  
				this.oTable.removeColumn(oColumn);
				this.oTable.insertColumn(oColumn, iIndex);
			});
		},

		/**
		 * Creates the table cells based on the provided columns state.
		 * Creates and returns an array of table cells based on the corresponding column state in the provided columns array.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aColumns - The columns state array.
		 * @returns {Array} - The array of table cells.
		 */
		_createProductsTableCells: function(aColumns) {
			return aColumns.map(oColumnState => {
				const sPath = this.oMetadataHelper.getProperty(oColumnState.key).path;
			  
				switch (oColumnState.key) {
					case constants.NAME_COL_ID:
						return new ObjectIdentifier({
							title: "{" + sPath + "}"
						});
					case constants.PRICE_COL_ID:
						return new ObjectNumber({
							number: "{" + sPath + "}",
							unit: this.getResourceBundle().getText("uUSD")
						});
					case constants.CREATED_COL_ID:
						return new Text({
							text: {
								path: sPath,
								type: "sap.ui.model.type.Date",
								formatOptions: {
									style: "medium",
									source: {
										pattern: "yyyy-MM-dd"
									}
								}
							}
						});
					default:
						return new Text({
							text: "{" + sPath + "}"
						});
				}
			});
		},

		/**
		 * Sets the visibility, sort indicator, and grouped state of all table columns to their initial values.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		_hideProductsTableColumns: function() {
			this.oTable.getColumns().forEach(oColumn => {
				oColumn.setVisible(false);
				oColumn.setSortIndicator(coreLibrary.SortOrder.None);
				oColumn.data("grouped", false);
			});
		},

		/**
		 * Binds the table items based on the provided sorter, filters and cell configuration.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aSorter - The array of Sorter instances.
		 * @param {Array} aCells - The array of table cells.
		 */
		_bindProductsTable: function(aSorter, aCells) {
			this.oTable.bindItems({
				templateShareable: false,
				path: '/products',
				filters: this.aTableFilters,
				sorter: aSorter,
				template: new ColumnListItem({
					cells: aCells
				})
			});
		},
		
		/**
		 * Event handler for the state change event of the p13n engine.
		 * Updates the table state based on the provided state object with sorters and cell configuration
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Object} oEvent - The state change event object.
		 */
		_onProductsTableStateChange: function(oEvent) {
			const oState = oEvent.getParameter("state");
  
			if (!oState) {
				return;
			}
			
			const aSorter = this._getProductsTableSorters(oState.Sorter, oState.Groups);
			
			this._hideProductsTableColumns();
			this._setProductsTableSortIndicators(oState.Sorter);
			this._setProductsTableGroups(oState.Groups);
			this._setProductsTableColumns(oState.Columns);
			
			const aCells = this._createProductsTableCells(oState.Columns);
			
			this._bindProductsTable(aSorter, aCells);
		},

		/**
		 * Opens the personalization (p13n) dialog for the table.
		 * Shows the p13n dialog for the table with the specified settings.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Object} oEvent - The event object that triggered the dialog opening.
		 */
		openP13nDialog: function(oEvent) {
			Engine.getInstance().show(this.oTable, ["Columns", "Sorter", "Groups"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvent.getSource()
			});
		},

		/**
		 * Handles the selection change event of the products table.
		 * Updates the delete button's enabled state based on the number of selected items.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The event object.
		 */
		onProductsTableSelectionChange: function(oEvent) {
			const aSelectedItems = oEvent.getSource().getSelectedItems();

			aSelectedItems.length 
			? this.getView().getModel("productsOverview").setProperty("/deleteBtnEnabled", true)
			: this.getView().getModel("productsOverview").setProperty("/deleteBtnEnabled", false)
		},

		/**
		 * Retrieves the products that are not selected for deletion.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aProducts - The array of all products.
		 * @param {Array} aSelectedProducts - The array of selected products.
		 * @returns {Array} The array of products to keep.
		 */
		_getProductsForDeletion: function(aProducts, aSelectedProducts) {
			const aSelectedProductsIds = aSelectedProducts
											.map(oProduct => oProduct.getBindingContext().getProperty("id"));
			return aProducts.filter(oProduct => !aSelectedProductsIds.includes(oProduct.id));
		},

		/**
		 * Deletes the selected products from the products array.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aSelectedProducts - The array of selected products.
		 * @returns {void}
		 */
		_deleteSelectedProducts: function(aSelectedProducts) {
			const aProducts = this.getView().getModel().getProperty("/products");
			const aUpdatedProducts = this._getProductsForDeletion(aProducts, aSelectedProducts);

			this.getView().getModel().setProperty("/products", aUpdatedProducts);
			this.oTable.removeSelections();
		},

		/**
		 * Retrieves the confirmation message for deleting selected products.
		 * @private
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {Array} aSelectedProducts - The array of selected products.
		 * @returns {string} The confirmation message.
		 */
		_getProductsDeleteConfirmationMessage: function(aSelectedProducts) {
			const iSelectedProductsCount = aSelectedProducts.length;
			let sConfirmationMessage;

			if (iSelectedProductsCount > 1) {
				sConfirmationMessage = this.getResourceBundle().getText("msgDeleteProducts", aSelectedProducts.length);
			} else {
				const sDeletedProductName = this.oTable.getSelectedItem().getBindingContext().getProperty("name");
				sConfirmationMessage = this.getResourceBundle().getText("msgDeleteProduct", sDeletedProductName);	
			}

			return sConfirmationMessage;
		},

		/**
		 * Handles the press event of the Delete Products button.
		 * Retrieves the confirmation message, shows a confirmation dialog,
		 * and performs the delete operation if confirmed.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onDeleteProductsPress: function() {
			const aSelectedProducts = this.oTable.getSelectedItems();
			const sConfirmationMessage = this._getProductsDeleteConfirmationMessage(aSelectedProducts);

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
						this._deleteSelectedProducts(aSelectedProducts);
						this.getView().getModel("productsOverview").setProperty("/deleteBtnEnabled", false);
					}
				}
			})
		},

		/**
		 * Handles the press event of a product navigation link.
		 * Navigates to the product details page for the selected product.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 * @param {sap.ui.base.Event} oEvent - The event object.
		 */
		onNavProductPress: function(oEvent) {
			const oProductContext = oEvent.getSource().getBindingContext();
			this.getRouter().navTo("ProductDetails", {
				productId: oProductContext.getProperty("id")
			})
		},

		/**
		 * Handles the press event of the Create Product button.
		 * Navigates to the new product creation page.
		 * @public
		 * @memberof aliaksandr.yemelyanau.products.managment.controller.ProductsOverview
		 */
		onCreateProductPress: function() {
			this.getRouter().navTo("NewProduct");
		}	
	});
});
