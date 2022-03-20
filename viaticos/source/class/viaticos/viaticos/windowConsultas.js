qx.Class.define("viaticos.viaticos.windowConsultas",
{
	extend : componente.comp.ui.ramon.window.Window,
	construct : function (appMain)
	{
		this.base(arguments);

	this.set({
		caption: "Consultas",
		width: 540,
		height: 270,
		showMinimize: false,
		showMaximize: false
	});
	this.setLayout(new qx.ui.layout.Canvas());
	
	this.addListenerOnce("appear", function(){
		rb1.focus();
	});
	
	
	
 
var rb1 = new qx.ui.form.RadioButton("Por titular:");
rb1.addListener("changeValue", function(e){
	if (e.getData()) {
		cboOrganismoAreaOrigen.setEnabled(false);
		cboPersonal.setEnabled(true);
	}
});
var rb2 = new qx.ui.form.RadioButton("Por Org/Area origen:");
rb2.addListener("changeValue", function(e){
	if (e.getData()) {
		cboOrganismoAreaOrigen.setEnabled(true);
		cboPersonal.setEnabled(false);
	}
});
var rb3 = new qx.ui.form.RadioButton("Por motivos");
rb3.addListener("changeValue", function(e){
	if (e.getData()) {
		cboOrganismoAreaOrigen.setEnabled(false);
		cboPersonal.setEnabled(false);
	}
});

	
	this.add(rb1, {left: 0, top: 10});
	
	var cboPersonal = new componente.comp.ui.ramon.combobox.ComboBoxAuto("services/", "viaticos.Viaticos", "autocompletarPersonal");
	var lstPersonal = cboPersonal.getChildControl("list");
	this.add(cboPersonal, {left: 130, top: 10, right: 0});
	
	this.add(rb2, {left: 0, top: 50});
	
	var cboOrganismoAreaOrigen = new componente.comp.ui.ramon.combobox.ComboBoxAuto("services/", "viaticos.Viaticos", "autocompletarOrganismoArea");
	var lstOrganismoAreaOrigen = cboOrganismoAreaOrigen.getChildControl("list");
	this.add(cboOrganismoAreaOrigen, {left: 130, top: 50, right: 0});
	
	
	this.add(rb3, {left: 0, top: 90});
	
	
	
	
	this.add(new qx.ui.basic.Label("Desde:"), {left: 20, top: 130});
	
	var dtfDesde = new qx.ui.form.DateField()
	dtfDesde.setValue(new Date());
	dtfDesde.setWidth(90);
	this.add(dtfDesde, {left: 70, top: 130});
	
	this.add(new qx.ui.basic.Label("Hasta:"), {left: 180, top: 130});
	
	var dtfHasta = new qx.ui.form.DateField()
	dtfHasta.setValue(new Date());
	dtfHasta.setWidth(90);
	this.add(dtfHasta, {left: 220, top: 130});
	

	var commandEsc = new qx.ui.command.Command("Esc");
	this.registrarCommand(commandEsc);
	commandEsc.addListener("execute", function(e){
		btnCancelar.fireEvent("execute");
	});
	
	var btnAceptar = new qx.ui.form.Button("Ver");
	btnAceptar.addListener("execute", function(e){
		cboPersonal.setValid(true);
		cboOrganismoAreaOrigen.setValid(true);
		dtfDesde.setValid(true);
		dtfHasta.setValid(true);
		if (rb1.getValue() && lstPersonal.isSelectionEmpty()) {
			cboPersonal.setInvalidMessage("Debe seleccionar titular");
			cboPersonal.setValid(false);
			cboPersonal.focus();
		}else if (rb2.getValue() && lstOrganismoAreaOrigen.isSelectionEmpty()) {
			cboOrganismoAreaOrigen.setInvalidMessage("Debe seleccionar Org/Area origen");
			cboOrganismoAreaOrigen.setValid(false);
			cboOrganismoAreaOrigen.focus();
		} else if (dtfHasta.getValue() - dtfDesde.getValue() < 0) {
			dtfDesde.setInvalidMessage("Intervalo definido incorrectamente");
			dtfHasta.setInvalidMessage("Intervalo definido incorrectamente");
			dtfDesde.setValid(false);
			dtfHasta.setValid(false);
			dtfDesde.focus();
		} else {
			var desde = dtfDesde.getValue();
			var hasta = dtfHasta.getValue();
			desde = desde.getFullYear() + "-" + qx.lang.String.pad(String(desde.getMonth() + 1), 2, "0") + "-" + qx.lang.String.pad(String(desde.getDate()), 2, "0");
			hasta = hasta.getFullYear() + "-" + qx.lang.String.pad(String(hasta.getMonth() + 1), 2, "0") + "-" + qx.lang.String.pad(String(hasta.getDate()), 2, "0");
			if (rb1.getValue()) {
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_historial_empleado&id_personal=" + lstPersonal.getModelSelection().getItem(0) + "&desde=" + desde + "&hasta=" + hasta);
			} else if (rb2.getValue()) {
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_total_dependencia&organismo_area_id=" + lstOrganismoAreaOrigen.getModelSelection().getItem(0) + "&desde=" + desde + "&hasta=" + hasta);
			} else {
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_total_motivos&desde=" + desde + "&hasta=" + hasta);
			}
		}
	}, this);

	var btnCancelar = new qx.ui.form.Button("Cerrar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	
	this.add(btnAceptar, {left: 170, bottom: 5});
	this.add(btnCancelar, {left: 310, bottom: 5});
	
	var rgp = new qx.ui.form.RadioGroup(rb1, rb2, rb3);
	
	},
	members : 
	{

	}
});