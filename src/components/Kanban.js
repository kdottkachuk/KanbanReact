import React from "react";
import { connect } from "react-redux";

import { DragDropContext } from "react-beautiful-dnd";

import Row from "./Row";
import styled from "styled-components";

import { addTask } from '../redux/actions/crudActions';

const KanbanWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

class Kanban extends React.Component {

  getRowIdByColumnId = columnId => {
    for (let rowId in this.state.rows) {
      if (this.state.rows[rowId].columns[columnId]) {
        return rowId;
      }
    }
    return undefined;
  };

  onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    let startRowId = this.getRowIdByColumnId(source.droppableId);
    let finishRowId = this.getRowIdByColumnId(destination.droppableId);

    const start = this.state.rows[startRowId].columns[source.droppableId];
    const finish = this.state.rows[finishRowId].columns[
      destination.droppableId
    ];

    if (start.id === finish.id) {
      let newTasksOrder = start.tasksOrder;
      newTasksOrder.splice(source.index, 1);
      newTasksOrder.splice(destination.index, 0, draggableId);

      const newState = this.state;

      finish.tasksOrder = newTasksOrder;
      newState.rows[finishRowId].columns[destination.droppableId] = finish;

      this.setState(newState);
    } else {
      let newStartTasksOrder = start.tasksOrder;
      newStartTasksOrder.splice(source.index, 1);
      start.tasksOrder = newStartTasksOrder;

      finish.tasks[draggableId] = start.tasks[draggableId];
      delete start.tasks[draggableId];

      let newFinishTasksOrder = finish.tasksOrder;
      newFinishTasksOrder.splice(destination.index, 0, draggableId);
      finish.tasksOrder = newFinishTasksOrder;

      let newState = this.state;

      newState.rows[startRowId].columns[source.droppableId] = start;
      newState.rows[finishRowId].columns[destination.droppableId] = finish;

      this.setState(newState);
    }
  };

  render() {
    this.state = this.props.newState;
    console.log('kanban render');
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
      >
        <KanbanWrapper>
          <h2>{this.state.title}</h2>
          {this.state.rowsOrder.map((rowId, index) => {
            const titled = index === 0;
            return (
              <Row
                titled={titled}
                key={rowId}
                row={this.state.rows[rowId]}
              />
            );
          })}
        </KanbanWrapper>
      </DragDropContext >
    );
  }
}

const mapStoreToProps = (state) => {
  return {
    newState: state
  }
}

export default connect(mapStoreToProps)(Kanban);
