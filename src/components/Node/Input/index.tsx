import * as React from 'react';
import './styles.scss';
import { APP_ID } from '../../../config';

type onBlurFieldTypeType = (
    event:React.FocusEvent<HTMLSelectElement>
)=>void;

type onBlurNameType = (
    event:React.FocusEvent<HTMLInputElement>
)=>void;

type onChangeFieldTypeType = (
    event:React.ChangeEvent<HTMLSelectElement>
)=>void;

type onChangeNameType = (
    event:React.ChangeEvent<HTMLInputElement>
)=>void;

type NodeInputType = {
    onChangeFieldType?:onChangeFieldTypeType,
    onChangeName?:onChangeNameType,
    onBlurName?:onBlurNameType,
    onBlurFieldType?:onBlurFieldTypeType,
    name?:string,
    fieldType?:string,
    node?:SDK.IShapeWidget,
    field?:boolean
}
const NodeInputBase:React.FC<NodeInputType> = (
    {
        onChangeName,
        onBlurName,
        onChangeFieldType,
        onBlurFieldType,
        name,
        fieldType,
        field,
        node
    }
) => {
    const isField = React.useMemo(
        ()=>node?.metadata[APP_ID].type === 'field' || field,
        [
            node,
            field
        ]
    );
    return(
        <section className='NodeInput'>
            <input
                value={name}
                onChange={onChangeName}
                onBlur={onBlurName}
                className="miro-input miro-input--primary"
                placeholder='name'
                style={
                    {
                        width:'100%'
                    }
                }
            />
            {
                isField?
                    <select
                        className="miro-select miro-select--secondary-bordered"
                        value={fieldType}
                        onChange={onChangeFieldType}
                        onBlur={onBlurFieldType}
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
        </section>
    )

}
export const NodeInput = React.memo(NodeInputBase);
