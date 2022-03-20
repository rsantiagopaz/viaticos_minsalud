/* ************************************************************************

   Copyright:
     2008 openWorks

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martín Alejandro Paz

************************************************************************ */

/**
* Objeto creado con un {@link qx.ui.basic.Label} y un {@link  qx.ui.form.ComboBox}.
* 
* *Ejemplo:*
*
* <pre class='javascript'>
*  var datosEstructura = 
*  [
*   {value: '1' , label: 'nombre del item1'},  
*   {label: 'nombre del item 2', value: '2'},
*   {label: 'nombre del item 3', value: '2', icon: 'icono.png'},
*   {label: 'nombre del item 4'},
*   {value: '5'}
*  ]
*  var cmbCombo = new qx.ui.form.ow.ComboBox("Label:",datosEstructura ,true);
*  </pre>

 */
qx.Class.define("qx.ui.form.ow.ComboBox",
{

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
	events:
	{
		/** 
		*  Se dispara cuando un valor del ComboBox cambia.
		*/
		"changeValue": "qx.event.type.Event"
	},
	extend : qx.ui.container.Composite,
	/**
	* @param label {String} Titulo que acompaña al ComboBox.
	* @param  structure {Map} Array de datos que se pasan al Constructor. <br />
	* *Parametros:*
	* <ul>
	* <li>*label:* Texto a mostrar en el item.</li>
	* <li>*value:* Valor del item.</li>
	* <li>*icon:* Icono del item.</li>
	* </ul>
	* _Aclaracion:_ Al menos debe existir _label_ o _value_, el cual cumplira la funcion de ambos.
	* @param emptySelected {Boolean ? false} Si se quiere activar el campo vacio al inicio de la lista.
	*/
	construct : function (label, structure, emptySelected)
	{
		this.base(arguments);

		this.setLayout(new qx.ui.layout.HBox(1));

		this._label = new qx.ui.basic.Label(label);
		this._label.setWidth(120);
		this._label.setRich(true);

		this._combo = new qx.ui.form.SelectBox();
		
		this._combo.setWidth(200);

		if (emptySelected)
		{
			this._emptySelected = emptySelected;
			this._combo.add(new qx.ui.form.ListItem("").set({model:""}));
		}

		for(var r in structure)
		{
			this.addValue(structure[r]);
		}

		this._combo.addListener("changeSelection", function ()
		{
			this.fireEvent('changeValue');
		}, this);

		this.add(this._label);
		this.add(this._combo);
	},
	
/*
*****************************************************************************
 MEMBERS
*****************************************************************************
*/
	members :
	{
		_label : null,
		_combo : null,
		_SQL : null,
		_fieldValue : null,
		_fieldDisplay : null,
		_emptySelected : null,
		/**
		* Agrega nuevo Item al ComboBox
		* @param itemStructure {String} 
		* Objeto de datos que se pasan al Constructor. <br />
		* *Parametros:*
		* <ul>
		* <li>*label:* Texto a mostrar en el item.</li>
		* <li>*value:* Valor del item.</li>
		* <li>*icon:* Icono del item.</li>
		* </ul>
		* _Aclaracion:_ Al menos debe existir _label_ o _value_, el cual cumplira la funcion de ambos.
		*
		* *Ejemplo:*
		*
		* <pre class='javascript'>		
		* cmbCombo.addValue({value:'1'});
		* cmbCombo.addValue({label:'item2', icon: 'icono.png'});
		* cmbCombo.addValue({label:'item3', value:'3'});
		* </pre>
		* @return {void}
		*/
		addValue : function (itemStructure)
		{
			var item = "";
			if ((itemStructure.label != null) && (itemStructure.label != ""))
			{
				if ((itemStructure.value != null) && (itemStructure.value != ""))
				{
					item = new qx.ui.form.ListItem(itemStructure.label, itemStructure.icon).set({model:itemStructure.value});
					this._combo.add(item);
				}
				else
				{
					item = new qx.ui.form.ListItem(itemStructure.label, itemStructure.icon).set({model:itemStructure.value});
					this._combo.add(item);
				}
			}
			else
			{
				if ((itemStructure.value != null) && (itemStructure.value != ""))
				{
					item = new qx.ui.form.ListItem(itemStructure.value, itemStructure.icon).set({model:itemStructure.value});
					this._combo.add(item);
				}
			}
			if ((itemStructure.selected == true) || (itemStructure.selected == "1"))
			{
				this._combo.setSelection([item]);
			}
		},
		/**
		* Devuelve el objeto *qx.ui.form.ComboBox* del objeto.
		* @return {qx.ui.form.ComboBox}
		*/
		getCombo : function () { return this._combo; },
		
		/**
		* Devuelve el objeto *qx.ui.basic.Label* del objeto.
		* @return {qx.ui.basic.Label}
		*/
		getLabel : function () { return this._label; },
		
		/**
		* Devuelve el valor del item seleccionado.
		* @return {String}
		*/
		getValue : function () { return this._combo.getModelSelection().getItem(0); },
		/**
		* Devuelve el texto mostrado por el item seleccionado.
		* @return {String}
		*/
		getValueDisplay : function () { return this._combo.getSelection()[0].getLabel(); },
		getRemoteData : function ()
		{
			var SQL = this._SQL;
			if (!SQL.hasListener("dataCompleted"))
			{
				SQL.addListener("dataCompleted", function (e)
				{
					this._combo.setValue("");
					while (this._combo.getChildrenContainer().getChildren().length > 1)
					{
						this._combo.removeAt(1);
					}
					if (!this._emptySelected)
					{
						if (this._combo.getChildrenContainer().getChildren().length > 0)
						{
							this._combo.removeAt(0);
						}
					}
					var xml = e.getData();
					var dataXML = xml.getElementsByTagName("reg");
					var rs = "";
					var data = [];
					for (var i=0; i<dataXML.length; i++)
					{
						rs = dataXML[i];
						this.addValue({value:rs.getAttribute(this._fieldValue), label:rs.getAttribute(this._fieldDisplay)});
					}
				}, this);
			}
			SQL.getData();
		},
		/**
		* Selecciona un item del ComboBox pasandole el valor.
		* @param value {String} valor del item.
		* @return {void}
		*/
		setValue : function (value)
		{
			if (value)
				this._combo.setModelSelection([value]);
			else
				this._combo.resetSelection();
		},
		
		/**[
		* Setea los valores del ComboBox, borrando los existentes.
		* @param values {String} valores.
		* @return {void}
		*/
		setNewValues : function (values, emptySelected) {
			this._combo.removeAll();
			if (emptySelected)
			{
				this._combo.add(new qx.ui.form.ListItem("").set({model:""}));
			}
			for(var r in values)
			{
				this.addValue(values[r]);
			}
		},
		/**
		* Selecciona un item del ComboBox pasandole el texto.
		* @param valueDisplay {String} texto del item.
		* @return {void}
		*/
		setValueDisplay : function (valueDisplay)
		{
			var r = "";
			var items = this._combo.getSelectables();
			for (r in items)
			{
				//*************** EL 'IF' ES PARCHE PARA INTERNET EXPLORER **********************
				if (typeof items[r] != 'function')
				{
					if (items[r].getLabel() == valueDisplay)
					{
						this._combo.setModelSelection([items[r].getModel()]);
					}
				}
			}
		},
		setSQL : function (SQL, fieldValue, fieldDisplay)
		{
			this._SQL = SQL;
			this._fieldValue = fieldValue;
			this._fieldDisplay = fieldDisplay;
		},
		focus : function ()
		{
			this._combo.focus();
		}

	}
});
