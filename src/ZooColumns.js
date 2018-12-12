import React, { Component } from 'react';
import { Button} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
/* DATA */
import objectProperties from './objectProperties.json';

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    background: isDragging ? "lightgreen" : "white",
    ...draggableStyle // styles we need to apply on draggables
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "rgba(25, 113, 127, 0.15)" : "rgba(25, 113, 127, 0.05)",
  display: "flex",
  overflow: "auto"
});

export default class ChooseColumns extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.current
        };
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragEnd(result) {
        if (!result.destination) { return; }

        const newSelected = Array.from(this.state.selected);
        const [removed] = newSelected.splice(result.source.index, 1);
        newSelected.splice(result.destination.index, 0, removed);

        this.setState({ newSelected });
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <DroppableArea id="selected" items={this.state.selected} />
            </DragDropContext>
        );
    }
}

class DroppableArea extends Component {
    render() {
        return (
            <Droppable droppableId={this.props.id} direction="horizontal">
                {(provided, snapshot) => (
                    <div
                        className="droppable-area"
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                        {...provided.droppableProps}
                    >
                        {this.props.items.map((item, index) => (
                            <DraggableColumn key={item} id={item} index={index} item={item} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    }
}

class DraggableColumn extends Component {
    render() {
        return(
            <Draggable draggableId={this.props.id} index={this.props.index}>
                {(provided, snapshot) => (
                    <div
                        className="btn btn-outline-secondary btn-sm draggable-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}
                    >
                        {this.props.item}
                    </div>
                )}
            </Draggable>
        );
    }
}