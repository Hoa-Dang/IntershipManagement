import React from 'react';
import '../attendance.css';

class Cell extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            id: props.rowId + "-td" + props.cellNum,
            date: props.cellData.date + " ",
            iconClass: this.getIconClass(props.cellData.attendance),
            showDropdown: false,
            selectDefaultValue: props.cellData.attendance
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.cellData !== newProps.cellData){
            this.setState({
                date: newProps.cellData.date + " ",
                iconClass: this.getIconClass(newProps.cellData.attendance),
                selectDefaultValue: newProps.cellData.attendance
            });
        }
    }

    getIconClass(attendance) {
        switch(attendance){
            case "P":
                return "fa fa-check custom-icon-green";
            case "A":
                return "fa fa-remove custom-icon-red";
            case "AR":
                return "fa fa-remove custom-icon-blue";
            case "O":
                return "fa fa-circle-o custom-icon-gray";
            default:
                return "";
        }
    }

    onCellHover(){
        if (this.state.iconClass !== "") {
            this.setState({showDropdown: true});
        }
    }

    onCellDeHover(){
        this.setState({showDropdown: false});
    }

    onSelectChange(event){
        this.setState({
            iconClass: this.getIconClass(event.target.value),
            selectDefaultValue : event.target.value
        });

        var object = {
            id: this.state.id,
            attendance: event.target.value
        };
        this.props.onCellChange(object);
    }


    render() {
        return (
            <td id={this.state.id} onMouseOver={this.onCellHover.bind(this)} onMouseLeave={this.onCellDeHover.bind(this)}>
                {this.state.date}
                <i className={this.state.iconClass}></i>
                {this.state.showDropdown ? 
                <select className="browser-default custom-select td-dropdown" value={this.state.selectDefaultValue} onChange={this.onSelectChange.bind(this)}>
                    <option value="P" className="custom-icon-green custom-bold">P</option>
                    <option value="A" className="custom-icon-red custom-bold">A</option>
                    <option value="AR" className="custom-icon-blue custom-bold">AR</option>
                    <option value="O" className="custom-icon-gray custom-bold">O</option>
                </select> : null}
            </td>
        );
    }
}

export default Cell;