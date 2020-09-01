import * as React from 'react';
import './styles.scss';
import { getChildShapes, updateShape,createCollectionShape, createDocumentShape, createFieldShape } from '../../../utils';
import { APP_ID } from '../../../config';
type NodeCardType = {
    node:SDK.IShapeWidget,
    recursive:boolean,
    fetchChildrens:boolean,
    small?:boolean
}
const NodeCardBase:React.FC<NodeCardType> = (
    {
        node,
        fetchChildrens,
        recursive,
        small
    }
) => {
    const isField = node.metadata[APP_ID].type === 'field';
    const [newShapeName,setnewShapeName] = React.useState('');
    const [name,setname] = React.useState(
        ()=>(
            isField?
                node.metadata[APP_ID].fieldName as string
            :
                node.plainText
        )
    );
    const [fieldType,setfieldType] = React.useState(isField? node.metadata[APP_ID].fieldType : '');
    const [childs,setchilds] = React.useState<SDK.IShapeWidget[]>([]);
    const [loading,setloading] = React.useState(false);
    React.useEffect(
        ()=>{
            setname(
                isField?
                    node.metadata[APP_ID].fieldName as string
                :
                    node.plainText
            )
            setfieldType(
                isField?
                    node.metadata[APP_ID].fieldType
                :
                    ''
            )
        },
        [
            node,
            isField,
            setfieldType,
            setname
        ]
    )
    const submitChanges = React.useCallback(
        (e:any)=>{
            e.preventDefault();
            if(isField){
                miro.board.widgets.update<SDK.IShapeWidget>(
                    {
                        id:node.id,
                        text:`<p><strong>${name}:</strong> ${fieldType}</p>`,
                        metadata:{
                            [APP_ID]:{
                                ...node.metadata[APP_ID],
                                fieldName:name,
                                fieldType:fieldType
                            }
                        }
                    }
                )
            }else{
                miro.board.widgets.update(
                    {
                        id:node.id,
                        text:`<p>${name}</p>`
                    }
                )
            }
        },
        [
            isField,
            node,
            fieldType,
            name
        ]
    )
    React.useEffect(
        ()=>{
            if(fetchChildrens){
                setloading(true);
                getChildShapes(node).then(
                    (c)=>{
                        setchilds(c);
                        setloading(false);
                    }
                ).catch(
                    ()=>{
                        setchilds([]);
                        setloading(false);
                    }
                )
            }
        },
        [
            fetchChildrens,
            setloading,
            node,
            setchilds
        ]
    )
    const classes = React.useMemo(
        ()=>{
            const currentClasses = ['NodeCard'];
            if(small){
                currentClasses.push('NodeCardSmall')
            }
            switch(node.metadata[APP_ID].type){
                case 'collection':
                    currentClasses.push('NodeCardCollection');
                    break;
                case 'document':
                    currentClasses.push('NodeCardDocument');
                    break;
                case 'field':
                    currentClasses.push('NodeCardField');
                    break;
                case 'database':
                    currentClasses.push('NodeCardDatabase');
                    break;
                default:
                    throw new Error('');
                    break;
            }
            return currentClasses;
        },
        [node,small]
    );

    const addShape = React.useCallback(
        async (tipo:'collection'|'field'|'document')=>{
            switch(tipo){
                case 'field':
                    await createFieldShape(
                        {
                            x:node.x,
                            y:node.y,
                            text:String(newShapeName),
                            parent:node
                        }
                    );
                    break;
                case 'document':
                    await createDocumentShape(
                        {
                            x:node.x,
                            y:node.y,
                            text:String(newShapeName),
                            parent:node
                        }
                    );
                    break;
                case 'collection':
                    await createCollectionShape(
                        {
                            x:node.x,
                            y:node.y,
                            text:String(newShapeName),
                            parent:node
                        }
                    );
                    break;
                default:
                    throw new Error();
                    break;
            }
            updateShape(node);
        },
        [
            node,
            newShapeName
        ]
    )
    return(
        <article className={classes.join(' ')}>
            <form onSubmit={submitChanges}>
                <input
                    value={name}
                    onChange={(e)=>setname(e.target.value)}
                    className="miro-input miro-input--primary"
                    placeholder="Name"
                    style={
                        {
                            width:'100%'
                        }
                    }
                />
                {
                    node.metadata[APP_ID].type === 'field'?
                        <select
                            className="miro-select miro-select--primary-bordered"
                            value={fieldType}
                            onChange={e=>setfieldType(e.target.value)}
                            onBlur={submitChanges}
                            style={
                                {
                                    width:'100%'
                                }
                            }
                        >
                            <option>array</option>
                            <option>boolean</option>
                            <option>bytes</option>
                            <option>datetime</option>
                            <option>float</option>
                            <option>geopoint</option>
                            <option>integer</option>
                            <option>map</option>
                            <option>null</option>
                            <option>reference</option>
                            <option>string</option>
                            <option>any</option>
                        </select>
                    :
                        null
                }
                {
                    small?
                        null
                    :
                        <button
                            className="miro-btn miro-btn--primary"
                            onClick={submitChanges}
                            style={
                                {
                                    width:'100%'
                                }
                            }
                        >Edit</button>
                }
            </form>
            <section className='NodeCardNewNode'>
                <h3 className='miro-h2'>new children</h3>
                <input
                    value={newShapeName}
                    onChange={(e)=>setnewShapeName(e.target.value)}
                    type='text'
                    className="miro-input miro-input--secundary"
                    placeholder="new children name"
                    style={
                        {
                            width:'100%'
                        }
                    }
                />
                <section className='NodeCardNewNodeButtons'>
                    <button
                        title="new collection"
                        className="NodeCardNewNodeButton NodeCardNewNodeButtonCollection"
                        onClick={()=>{addShape('collection')}}
                    >+</button>
                    <button
                        title="new document"
                        className="NodeCardNewNodeButton NodeCardNewNodeButtonDocument"
                        onClick={()=>{addShape('document')}}
                    >+</button>
                    <button
                        title="new field"
                        className="NodeCardNewNodeButton NodeCardNewNodeButtonField"
                        onClick={()=>{addShape('field')}}
                    >+</button>
                </section>
            </section>
            {
                loading?
                    <p>loading....</p>
                :
                    childs.length?
                        <section className='NodeCardChilds'>
                            {
                                childs.map(
                                    child=><NodeCardBase
                                        node={child}
                                        fetchChildrens={recursive}
                                        recursive={recursive}
                                        small
                                    />
                                )
                            }
                        </section>
                    :
                        null
            }
        </article>
    )
}
NodeCardBase.defaultProps = {
    recursive:false,
    fetchChildrens:false,
    small:false
}
export const NodeCard = React.memo(NodeCardBase);