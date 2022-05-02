qx.Class.define("viaticos.viaticos.windowPersonal",
{
	extend : componente.comp.ui.ramon.window.Window,
	construct : function (appMain)
	{
		this.base(arguments);

	this.set({
		caption: "Personal",
		width: 800,
		height: 400,
		showMinimize: false,
		showMaximize: false
	});
	this.setLayout(new qx.ui.layout.Canvas());
		
	this.addListenerOnce("appear", function(){
		txtBuscar.focus();
	});
		
		


	var commandEditar = new qx.ui.command.Command("F2");
	commandEditar.setEnabled(false);
	commandEditar.addListener("execute", function(e){
		if (tbl.getFocusedColumn()==0) tbl.setFocusedCell(1, tbl.getFocusedRow());
		tbl.startEditing();
	});
	
	
	var menu = new componente.comp.ui.ramon.menu.Menu();
	var btnCambiar = new qx.ui.menu.Button("Editar", null, commandEditar);
	menu.add(btnCambiar);
	menu.memorizar();

		
		
	
	this.add(new qx.ui.basic.Label("Ape/Nom:"), {left: 0, top: 3});
	var txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setWidth(200);
	this.add(txtBuscar, {left: 60, top: 0});
	
	var btnBuscar = new qx.ui.form.Button("Buscar");
	btnBuscar.addListener("execute", function(e){
		if (txtBuscar.getValue().trim()!="") {
			tbl.setFocusedCell();
			var p = {descrip: txtBuscar.getValue()};
			var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
			try {
				var resultado = rpc.callSync("leer_personal", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			//var json = qx.util.Serializer.toJson(appMain.objMoneda.store.getModel());
	
			tableModel.setDataAsMapArray(resultado, true);
	
			if (tableModel.getRowCount() > 0) tbl.setFocusedCell(0, 0, true);
		}
	});
	this.add(btnBuscar, {left: 270, top: 0});
	
		
		//Tabla

		var tableModel = new qx.ui.table.model.Filtered();
		tableModel.setColumns(["Ape/Nom (Dni)", "Cod.002", "Funcionario", "Eximir tope viático"], ["descrip", "codigo_002", "funcionario", "eximir_tope_viatico"]);
		//tableModel.setEditable(true);
		tableModel.setColumnEditable(1, true);
		tableModel.setColumnEditable(2, true);
		tableModel.setColumnEditable(3, true);

		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tbl = new componente.comp.ui.ramon.table.Table(tableModel, custom);
		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.setShowCellFocusIndicator(true);
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();
		
		var tableColumnModel = tbl.getTableColumnModel();
		tableColumnModel.setColumnVisible(3, (appMain.rowOrganismo_area.perfiles["037004"]!=null));
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(0, {width:"60%", minWidth:100});
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(2, {width:"10%", minWidth:100});
		resizeBehavior.set(3, {width:"20%", minWidth:100});
		
		
		var celleditorNumber = new qx.ui.table.celleditor.TextField();
		celleditorNumber.setValidationFunction(function(newValue, oldValue){
			newValue = newValue.trim();
			if (newValue=="") return oldValue;
			else if (isNaN(newValue)) return oldValue; else return newValue;
		});
		tableColumnModel.setCellEditorFactory(1, celleditorNumber);
		
		
		var cellrendererBool = new qx.ui.table.cellrenderer.Boolean();
		tableColumnModel.setDataCellRenderer(2, cellrendererBool);
		tableColumnModel.setDataCellRenderer(3, cellrendererBool);
		
		var celleditorChk = new qx.ui.table.celleditor.CheckBox();
		tableColumnModel.setCellEditorFactory(2, celleditorChk);
		tableColumnModel.setCellEditorFactory(3, celleditorChk);
		


		

		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (selectionModel.getSelectedCount() > 0);
			commandEditar.setEnabled(bool);
			menu.memorizar([commandEditar]);
		});
		
		
		
		
		

		tbl.setContextMenu(menu);

		
		
		this.add(tbl, {left: 0, top: 30, right: 0, bottom: 0});
		
		tbl.addListener("dataEdited", function(e){
			var focusedRow = tbl.getFocusedRow();
			var rowData = tableModel.getRowData(focusedRow);
			var rowDataAsMap = tableModel.getRowDataAsMap(focusedRow);
			var p = {id_personal: rowData.id_personal, codigo_002: rowDataAsMap.codigo_002, funcionario: rowDataAsMap.funcionario, eximir_tope_viatico: rowDataAsMap.eximir_tope_viatico};
			var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
			try {
				var resultado = rpc.callSync("escribir_personal", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
		});
		
		
		txtBuscar.setTabIndex(1);
		btnBuscar.setTabIndex(2);
		tbl.setTabIndex(3);
	
		
	},
	members : 
	{

	}
});