import { takeLatest } from 'redux-saga'
import { call, fork, put } from 'redux-saga/effects'
import * as ActionTypes from '../constants/ActionTypes'
import watchAddTodo from './add-todo'
import watchEditTodo from './edit-todo'
import watchDeleteTodo from './delete-todo'
import watchFetchTodos from './fetch-todos'
import watchClearCompletedTodos from './clear-completed'

export function* completeTodo(action) {
  const { id, completed: c } = action

  // why does this get called on init?
  if (!id) return

  try {
    const todo = yield call(
      api, 
      '/complete-todo', 
      { 
        method: 'POST', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id }) 
      }
    )

    const { completed } = todo

    yield put({ type: ActionTypes.COMPLETE_TODO_SUCCEEDED, id, completed })
  } catch (e) {
    yield put({ type: ActionTypes.COMPLETE_TODO_FAILED, id, c })
  }
}

export function* completeAllTodos(action) {
  // todo pass all todos
  const { id, completed: c } = action

  try {
    const todo = yield call(
      api, 
      '/complete-all', 
      { 
        method: 'POST', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: ''
      }
    )

    yield put({ type: ActionTypes.COMPLETE_ALL_SUCCEEDED })
  } catch (e) {
    yield put({ type: ActionTypes.COMPLETE_TODO_FAILED, id, c })
  }
}

function api(url, opts) {
  return fetch(url, opts)
    .then(function (resp) {
      return resp.json()
    })
    .then(function (resp) {
      return resp
    })
}

export default function* watchMany() {
  yield [
    fork(watchAddTodo),
    fork(watchEditTodo),
    fork(watchFetchTodos),
    fork(watchDeleteTodo),
    takeLatest(ActionTypes.COMPLETE_TODO_REQUESTED, completeTodo),
    takeLatest(ActionTypes.COMPLETE_ALL_REQUESTED, completeAllTodos),
    fork(watchClearCompletedTodos)
  ]
}
