import React, { Component } from 'react';

class Dropdown extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listOpen: false,
            headerTitle: "Dropdown Test"
        }
    }

    handleClickOutside() {
        this.setState({
            listOpen: false
        });
    }

    toggleList() {
        this.setState(prevState => ({
            listOpen: !prevState.listOpen
        }));
    }

    render() {
        const{list} = this.props;
        const{listOpen, headerTitle} = this.state;

        return(
            <div className="dd-wrapper">
                <div className="dd-header" onClick={() => this.toggleList()}>
                    <div className="dd-header-title">{headerTitle}</div>
                </div>
                {listOpen && <ul className="dd-list">
                    {list.map((item) => (
                        <li className="dd-list-item" key={item.id} >list item</li>
                    ))}
                </ul>}
            </div>
        )
    }
}

export default Dropdown;