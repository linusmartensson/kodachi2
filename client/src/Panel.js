
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
            case 'input_select':

                console.dir(elem);

                const values = elem.content.values.map((p) => 
                    <option className="PanelSelectOption" key={p} value={p}>{p}</option>
                );
                return <select className="PanelSelect" key={elem.id} name={elem.id} multiple>{values}</select>

            default: return <p key={elem.id}>{elem.type}</p>;
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
