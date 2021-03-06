import React, { useContext, useReducer, useRef } from 'react'
import { Link } from '@reach/router'
import { Button, Flex, NavLink, Container, Label, Input, Checkbox } from 'theme-ui'
import { gql, useMutation, useQuery } from '@apollo/client'
import { IdentityContext } from '../../netlfyContext'

const ADD_TODO = gql`
    mutation AddTodo($text: String!){
        addTodo(text: $text){
            id
        }
    }
`;
const UPDATE_TODO_DONE = gql`
    mutation updateTodoDone($id: ID!){
        addTodo(id: $id){
            text
            done
            
        }
    }
`;
const GET_TODOS = gql `
    query GetTodos {
        todos{
            id
            text
            done
        }
    }
`
const todosReducer = (state, action) => {
    switch (action.type) {
        case "addTodo":
            return [{ done: false, value: action.payload }, ...state];
        case "toggleTodoDone":
            const newState = [...state];
            newState[action.payload] = {
                done: !state[action.payload].done,
                value: state[action.payload].value
            };
            return newState;
            default:
                return state
    }
};



function Dashboard() {
    const { user, identity: netlifyIdentity } = useContext(IdentityContext)
    const [todos] = useReducer(todosReducer, []);
    const inputRef = useRef()
    const [addTodo] = useMutation(ADD_TODO)
    const [updateTodoDone] = useMutation(UPDATE_TODO_DONE)
    const {loading,data,error,refetch} = useQuery(GET_TODOS)
    console.log('this is user', user)
    console.log(todos)

    return (
        <div>
            <Container>
                <Flex as='nav'>
                    <NavLink as={Link} to='/' href='#!' p={2}>
                        Home
                    </NavLink>
                    <NavLink as={Link} to='/app' p={2}>
                        DashBoard
                    </NavLink>
                    <NavLink sx={{ cursor: 'pointer' }} p={2} onClick={() => netlifyIdentity.open(false)}   >
                        logout
                    </NavLink>
                    {user && (<NavLink p={2}>

                        {user.user_metadata.full_name}
                    </NavLink>)}

                </Flex>
                <Flex as="form" onSubmit={async e => {
                    e.preventDefault();
                    await  addTodo({variables:{text:inputRef.current.value }})
                  inputRef.current.value = ""
                   await refetch()
                }}>
                    <Label sx={{ display: "flex" }}>
                        <span>Add : Todo</span>
                        <Input ref={inputRef} sx={{ marginLeft: 1 }} />
                    </Label>
                    <Button sx={{ marginLeft: 1 }}>submit</Button>
                </Flex>
                
                
                <Flex sx={{ flexDirection: 'column' }}>
                {loading ? <div>loading ... </div>: null}
                {error ? <div>{error.message} </div>: null}
                {!loading  && !error && (
                    <ul sx={{ listStyleType: "none" }}>
                        {data.todos.map(todo => (
                            <Flex
                                key={todo.id}
                                as="li"
                                onClick={() => {
                                    updateTodoDone({variables:{id:todo.id}})
                                }}
                            >
                                <Checkbox checked={todo.done} />
                                <span>{todo.text}</span>
                            </Flex>
                        ))}
                    </ul>)
                }
                </Flex>


            </Container>
        </div>
    )
}



export default Dashboard
