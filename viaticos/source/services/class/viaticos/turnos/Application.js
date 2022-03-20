/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(turnos/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "turnos"
 */
qx.Class.define("turnos.Application",
{
	extend : qx.application.Standalone,
	statics :
	{
		Login : function (title, usuario, functionClose, context)
		{
			var winLogin = new qx.ui.window.Window(title);
			winLogin.addListener("resize", winLogin.center, winLogin);
			winLogin.set({showMaximize:false, allowMaximize:false, showMinimize:false, showClose:false, modal:true, movable:false, resizable:false, showStatusbar:false});
			winLogin.setLayout(new qx.ui.layout.Basic());
			
			var txtUsuario = new qx.ui.form.ow.TextField("Usuario:").set({enabled:true});
				txtUsuario.getLabel().setWidth(60);
			var txpPassword = new qx.ui.form.ow.PassField("Password:").set({enabled:true});
				txpPassword.getLabel().setWidth(60);
			var lblMSJ = new qx.ui.basic.Label("").set({rich:true, textAlign:'center', visibility:'excluded'});
			var btnIngresar = new qx.ui.form.Button("Validar Datos");
			var cmbServicios = new qx.ui.form.ow.ComboBox("Servicio:").set({visibility:'hidden'});
				cmbServicios.getLabel().setWidth(60);
				cmbServicios.getCombo().setWidth(500);
			
			if ((usuario != "") && (usuario != null) && (usuario != undefined))
			{
				txtUsuario.setValue(usuario);
				txtUsuario.setEnabled(false);
			}
			
			txtUsuario.getText().addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					txpPassword.getText().tabFocus();
			}, this);
			
			txpPassword.getText().addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					btnIngresar.execute();
			}, this);
			
			winLogin.add(txtUsuario, {left:150, top:0});
			winLogin.add(txpPassword, {left:150, top:30});
			winLogin.add(lblMSJ, {left:200, top:60});
			winLogin.add(cmbServicios, {left:0, top:60});
			winLogin.add(btnIngresar, {left:250, top:90});
			
			if ((usuario != "") && (usuario != null) && (usuario != undefined))
			{
				var btnSalir = new qx.ui.form.Button("Salir e Ingresar con otro Usuario");
				btnSalir.addListener("execute", function ()
				{
					location.reload(true);
				});
				winLogin.add(btnSalir);
			}
			
			btnIngresar.addListener("execute", function (e)
			{
				var rpc = new qx.io.remote.Rpc();
				rpc.setTimeout(10000);
				rpc.setUrl("services/");
				rpc.setServiceName("turnos.login");
				var params = new Object();
				params.usuario = txtUsuario.getValue();
				params.password = txpPassword.getValue();
				params.servicio = cmbServicios.getValue();
				try
				{
					if (btnIngresar.getLabel() != "Ingresar")
					{
						var result = rpc.callSync("Login", params);
						if (result.login == true)
						{
							txtUsuario.setEnabled(false);
							txpPassword.setEnabled(false);
							lblMSJ.setVisibility("excluded");
							lblMSJ.setValue("");
							cmbServicios.setVisibility("visible");
							cmbServicios.setNewValues(result.servicios);
							btnIngresar.setLabel("Ingresar");
						}
						else
						{
							if (result)
							{
								cmbServicios.setVisibility("hidden");
								lblMSJ.setValue("<font color='red'>Ud. no posee permisos para este Sistema.!</font>");
								lblMSJ.setVisibility("visible");
							}
							else
							{
								cmbServicios.setVisibility("hidden");
								lblMSJ.setValue("<font color='red'>Usuario y/o Password incorrecta!</font>");
								lblMSJ.setVisibility("visible");
							}
							if ((usuario != "") && (usuario != null) && (usuario != undefined))
							{
								txpPassword.focus();
							}
							else
							{
								txtUsuario.focus();
							}
						}
					}
					else
					{
						var result = rpc.callSync("Ingresar", params);
						this._SYSusuario = txtUsuario.getValue();
						winLogin.close();
					}
				}
				catch (ex)
				{
					lblMSJ.setValue("<font color='red'>Se produjo un error en el Sistema!</font>");
					alert(ex);
				}
			}, this);

			if ((functionClose != "") && (functionClose != null) && (functionClose != undefined))
			{
				if (context)
					winLogin.addListener("close", functionClose, context);
				else
					winLogin.addListener("close", functionClose);
			}
			
			winLogin.open();
			if ((usuario != "") && (usuario != null) && (usuario != undefined))
			{
				txpPassword.focus();
			}
			else
			{
				txtUsuario.focus();
			}
		}
	},
	members :
	{
		main : function()
		{
			this.base(arguments);
			if (qx.core.Variant.isSet("qx.debug", "on"))
			{
				qx.log.appender.Native;
				qx.log.appender.Console;
			}
			
			this.getRoot().set({
				blockerColor: '#bfbfbf',
				blockerOpacity: 0.6
			});
			
			var doc = this.getRoot();
			
			var rpc = new qx.io.remote.Rpc();
			rpc.setTimeout(10000);
			rpc.setUrl("services/");
			rpc.setServiceName("turnos.login");
			try
			{
				var params = new Object();
				params.version = "";
				var result = rpc.callSync("Logueado", params);
				if (!result)
				{
					turnos.Application.Login("Identificacion de Usuario", "", this._InitAPP, this);
				}
				else
				{
					this._SYSusuario = result;
					this._InitAPP();
				}
			}
			catch (ex)
			{
				alert(ex);
			}
		},
		_InitAPP : function ()
		{
			var layer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
			var scroll = new qx.ui.container.Scroll();
			layer.add(scroll);
			var con = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
			con.setAllowShrinkY(false);
			
			scroll.add(con);
			scroll.setScrollbarY("auto");
			
			
			var doc = this.getRoot();
			var app = this._appFireTab = new qx.ui.form.ow.Firetab(1024, 700);
			var menu = this._getMenu();
			
			app.setMenu(menu);
			con.add(app);
			
			doc.add(layer, {edge:0});
			
			var form = new qx.ui.form.ow.FormTab("id_turnos", "Turnos", "", true);
			form.add(new turnos.forms.Turnos);
			app.openForm(form);
		},
		_getMenu : function ()
		{
			var rpc = new qx.io.remote.Rpc().set({timeout:5000, url:"services/", serviceName:"turnos.login"});
			try
			{
				var result = rpc.callSync("getDatosUsuario");
				var lblPerfil = "<u><b>Usuario</b></u>: " + result[0].SYSusuario + " <br /><u><b>Nombres y Apellido</b></u>: " + result[0].SYSusuarionombre;
			}
			catch (ex)
			{
				alert(ex);
			}
			var menu = 
			{
				"sections":
				[
					{ "value" : "buscar_turno", "label" : "Buscar Turno", "icon" : "turnos/lupa.png", "action" : this.BuscarTurnoPaciente, "context": this },
					{ "value" : "abm_agenda", "label" : "Agenda", "icon" : "turnos/agenda.png", "action" : this.ABMAgenda, "context": this },
					{ "value" : "duracion_turno", "label" : "Duración del Turno", "icon" : "turnos/reloj2.png", "action" : this.DuracionTurno, "context": this },
					{ "value" : "abm_personas", "label" : "ABM de Personas", "icon" : "turnos/personas.png", "action" : this.ABMPersonas, "context": this },
					{ "op_menu" : "label", "value": lblPerfil },
					{
						"op_menu" : "spacer"
					},
					{
						"value" : "id_password",
						"label" : "Cambiar Password",
						"icon" : "turnos/llaves.png",
						"action" : this._CambiarPassword,
						"context" : this
					},
					{
						"value" : "id_bloquear",
						"label" : "Bloquear",
						"icon" : "turnos/candadoCerrado.png",
						"action" : this._Bloquear,
						"context" : this
					},
					{
						"value" : "id_salir",
						"label" : "Salir",
						"icon" : "turnos/salir.png",
						"action" : this.Logout // esta opcion es en caso de que no querramos que se forme un submenu, sino un simple boton.
					}
				]
			};
			return menu;
		},
		BuscarTurnoPaciente : function ()
		{
			if (this._appFireTab.isOpen("id_buscar_turno"))
			{
				this._appFireTab.setFocusForm("id_buscar_turno");
			}
			else
			{
				var form = new turnos.forms.BuscarTurnoPaciente();
				this._appFireTab.openForm(form);
			}
		},
		ABMAgenda : function ()
		{
			if (this._appFireTab.isOpen("id_abmagenda"))
			{
				this._appFireTab.setFocusForm("id_abmagenda");
			}
			else
			{
				var form = new turnos.forms.ABMAgenda();
				this._appFireTab.openForm(form);
			}
		},
		DuracionTurno : function ()
		{
			var win = new qx.ui.window.Window("Duracion del Turno");
			win.setLayout(new qx.ui.layout.VBox(2));
			win.setShowMinimize(false);
			win.setShowMaximize(false);
			win.addListener("resize", win.center, win);
			win.setModal(true);
			win.add(new turnos.wg.DuracionTurno(true));
			win.open();
		},
		ABMPersonas : function ()
		{
			if (this._appFireTab.isOpen("ABMPersonas"))
			{
				this._appFireTab.setFocusForm("ABMPersonas");
			}
			else
			{
				var form = new qx.ui.form.ow.FormTab("ABMPersonas", "ABM de Personas");
				form.add(new turnos.wg.ABMPersonas(), {left:20, top:20});
				this._appFireTab.openForm(form);
			}
		},
		_CambiarPassword : function ()
		{
			var win = new qx.ui.window.Window("Cambio de Password");
			win.addListener("resize", win.center, win);
			win.set({width:350, height:140, showMaximize:false, allowMaximize:false, showMinimize:false, showClose:true, modal:true, movable:false, resizable:false, showStatusbar:false});
			win.setLayout(new qx.ui.layout.VBox(5));
			
			var txpPasswordActual = new qx.ui.form.ow.PassField("Password Actual:");
			var txpNewPassword1 = new qx.ui.form.ow.PassField("Password Nueva:");
			var txpNewPassword2 = new qx.ui.form.ow.PassField("Reescriba la Password:");
			var btnCambiar = new qx.ui.form.Button("Cambiar Password");
			
			txpPasswordActual.getText().addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					txpNewPassword1.getText().tabFocus();
			}, this);
			
			txpNewPassword1.getText().addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					txpNewPassword2.getText().tabFocus();
			}, this);
			
			txpNewPassword2.getText().addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					btnCambiar.execute();
			}, this);
			
			btnCambiar.addListener("execute", function ()
			{
				if (txpNewPassword1.getValue() == txpNewPassword2.getValue())
				{
					var rpc = new qx.io.remote.Rpc();
					rpc.setTimeout(10000);
					rpc.setUrl("services/");
					rpc.setServiceName("turnos.login");
					var params = new Object();
					params.actual = txpPasswordActual.getValue();
					params.password = txpNewPassword1.getValue();
					try
					{
						var result = rpc.callSync("set_password", params);
						if (result)
						{
							alert("Se cambio correctamente la password.");
							win.close();
						}
						else
						{
							alert("No se cambio la password ya que ingreso mal la password actual.");
							txpPasswordActual.focus();
						}
					}
					catch (ex)
					{
						alert(ex);
					}
				}
				else
				{
					alert("No ingreso correctamente la password nueva.");
					txpNewPassword1.focus();
				}
			}, this);
			
			win.add(txpPasswordActual);
			win.add(txpNewPassword1);
			win.add(txpNewPassword2);
			win.add(btnCambiar);
			win.open();
			
			txpPasswordActual.focus();
		},
		_Bloquear : function ()
		{
			var rpc = new qx.io.remote.Rpc();
			rpc.setTimeout(10000);
			rpc.setUrl("services/");
			rpc.setServiceName("turnos.login");
			try
			{
				var params = new Object();
				params.version = "";
				var result = rpc.callSync("Logueado", params);
				if (result)
				{
					this._SYSusuario = result;
					var rpc = new qx.io.remote.Rpc();
					rpc.setTimeout(10000);
					rpc.setUrl("services/");
					rpc.setServiceName("turnos.login");
					rpc.callSync("Logout");
					turnos.Application.Login("Sistema Bloqueadoo. Indentifiquese para continuar.", this._SYSusuario);
				}
			}
			catch (ex)
			{
				alert(ex);
			}
		},
		Logout : function ()
		{
			var rpc = new qx.io.remote.Rpc();
			rpc.setTimeout(10000);
			rpc.setUrl("services/");
			rpc.setServiceName("turnos.login");
			try
			{
				var result = rpc.callSync("Logout");
				location.reload(true);
			}
			catch (ex)
			{
				alert(ex);
			}
		}
	}
});
