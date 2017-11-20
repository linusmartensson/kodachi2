
import React, { Component } from 'react';
import Caption from './Caption';
import SpeechBubble from './SpeechBubble';
import './Panel.css'
class Panel extends Component {
  render() {

    var panelConfig = "Panel";
    if(!this.props.border) panelConfig += " Panel-borderless"

    var panelStyle = {
        width:this.props.width?"calc("+this.props.width+"% - 20px)":"",
    }

    const content = this.props.content.map((elem) => {
        if(!elem.type) return null;
        switch(elem.type){
            case 'caption': return <Caption key={elem.id} content={elem.text} strength={elem.strength} />;
            case 'clear': return <div key={elem.id} style={{clear:'both'}}></div>
            case 'text': return <p className="PanelText" key={elem.id}>{elem.text}</p>;
            case 'speechbubble': return <SpeechBubble position={elem.position} key={elem.id} text={elem.text} speaker={elem.image} />;
            case 'button': return <input className="PanelButton" type="submit" onClick={(e)=>{e.target.clicked=true;}} key={elem.id} name={elem.id} value={elem.text} />
            case 'input_password': return <input className="PanelInput" type="password" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_ssn': return <input placeholder='YYMMDD-NNNN' className="PanelInput" type="text" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_simpletext':
            case 'input_text': 
                return <input placeholder="" className="PanelInput" type="text" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_email': return <input placeholder="you@kodachi.se" className="PanelInput" type="text" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_editor': 
                return <textarea autoCapitalize="sentences" autoComplete="off" cols="60" rows="8" placeholder="Texttexttext!" className="PanelEditor" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_time':
                return <input className="PanelInput" type="time" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_date':
                return <input className="PanelInput" type="date" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_number':
                return <input className="PanelInput" type="number" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_bool':
                return <input className="PanelCheckbox" type="checkbox" key={elem.id} name={elem.id} value={elem.text} />
            case 'input_file':
            case 'input_image':
                return <input className="PanelInput" type="file" key={elem.id} name={elem.id} value={elem.text} />

            case 'input_staticselect':
            case 'input_select':
            case 'input_dropdown':
            case 'input_amount':

                var values = [];
                if(elem.type === "input_amount") {
                    elem.content.values = [0,1,2,3,4,5,6,7,8,9,10];
                } 
                var pos = 0;
                values = elem.content.values.map((p) => 
                    <option className="PanelSelectOption" key={p} value={elem.type==='input_dropdown'||elem.type=='input_staticselect'?pos++:p}>{p}</option>
                );
                if(elem.type === "input_select" || elem.type==='input_staticselect')
                    return <select className="PanelSelect" key={elem.id} name={elem.id} multiple>{values}</select>
                else
                    return <select className="PanelSelect" key={elem.id} name={elem.id}>{values}</select>

            default: 
                return <p key={elem.id}>{elem.type}</p>;
        }
    });


    var v = (
            <div style={panelStyle} className={panelConfig}><div className="Panel-inside">
            {content}
            </div></div>);



    return v;
  }
}

export default Panel;
