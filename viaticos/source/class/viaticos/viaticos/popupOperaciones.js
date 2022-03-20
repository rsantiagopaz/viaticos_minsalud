qx.Class.define("viaticos.viaticos.popupOperaciones",
{
	extend : componente.comp.ui.ramon.popup.Popup,
	construct : function (dataAsMapArray)
	{
	this.base(arguments);
	
	this.set({
		width: 800,
		height: 200
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	

	//Tabla

	var tableModelDetalle = this.tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Fecha", "Org/Area", "Usuario", "Operación"], ["fecha", "organismo_area", "usuario", "operacion"]);
	
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalle = new componente.comp.ui.ramon.table.Table(tableModelDetalle, custom);
	tblDetalle.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.setShowCellFocusIndicator(false);
	tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.toggleStatusBarVisible();
	
	
		var tableColumnModel = tblDetalle.getTableColumnModel();
		
		//tableColumnModel.setColumnVisible(0, false);
      // Obtain the behavior object to manipulate
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(0, {width:"9%", minWidth:100});
		resizeBehavior.set(1, {width:"63%", minWidth:100});
		resizeBehavior.set(2, {width:"20%", minWidth:100});
		resizeBehavior.set(3, {width:"8%", minWidth:100});

	
	
	this.add(tblDetalle, {left: 3, top: 3, right: 3, bottom: 3});
	
	

	
	
	tableModelDetalle.setDataAsMapArray(dataAsMapArray, true);

	
	
	},
	members : 
	{

	}
});