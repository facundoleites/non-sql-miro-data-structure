import * as React from "react";
import * as ReactDOM from "react-dom";
import './styles/library.scss';
import { isAppShape, createCollectionShape, createDocumentShape, createFieldShape, createDatabaseShape } from "./utils";
import { Layout } from "./layouts/Layout";

const ShapeDatabaseBase = () => (
    <div className='LibraryShape LibraryShapeDatabase' data-type="database">
        database
    </div>
)
const ShapeDatabase = React.memo(ShapeDatabaseBase);
const ShapeCollectionBase = () => (
    <div className='LibraryShape LibraryShapeCollection' data-type="collection">
        collection
    </div>
)
const ShapeCollection = React.memo(ShapeCollectionBase);

const ShapeDocumentBase = () => (
    <div className='LibraryShape LibraryShapeDocument' data-type="document">
        document
    </div>
)
const ShapeDocument = React.memo(ShapeDocumentBase);

const ShapeFieldBase = () => (
    <div className='LibraryShape LibraryShapeField' data-type="field">
        field
    </div>
)
const ShapeField = React.memo(ShapeFieldBase);

const createDatabaseShapePreview = (el:HTMLElement) => {
    const canvas = document.createElement('canvas');
    const txtHeight = 48;
    canvas.width = 328;
    canvas.height = txtHeight*1.2;
    const ctx = canvas.getContext('2d');
    if(!ctx){
        throw new Error('no context');
    }
    ctx.fillStyle = '#1a3d4a';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = `${txtHeight}px Arial`;
    ctx.fillStyle = '#F38C8D';
    const {width:txtWidth} = ctx.measureText(el.innerHTML);
    ctx.fillText(el.innerHTML,(canvas.width - txtWidth) / 2, (canvas.height - txtHeight)/2 + txtHeight);
    return canvas.toDataURL();
}
const createCollectionShapePreview = (el:HTMLElement) => {
    const canvas = document.createElement('canvas');
    const txtHeight = 48;
    canvas.width = 328;
    canvas.height = txtHeight*1.2;
    const ctx = canvas.getContext('2d');
    if(!ctx){
        throw new Error('no context');
    }
    ctx.fillStyle = '#F38C8D';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = `${txtHeight}px Arial`;
    ctx.fillStyle = '#1a3d4a';
    const {width:txtWidth} = ctx.measureText(el.innerHTML);
    ctx.fillText(el.innerHTML,(canvas.width - txtWidth) / 2, (canvas.height - txtHeight)/2 + txtHeight);
    return canvas.toDataURL();
}

const createDocumentShapePreview = (el:HTMLElement) => {
    const canvas = document.createElement('canvas');
    const txtHeight = 36;
    canvas.width = 328;
    canvas.height = txtHeight*1.2;
    const ctx = canvas.getContext('2d');
    if(!ctx){
        throw new Error('no context');
    }
    ctx.fillStyle = '#F2B8A2';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = `${txtHeight}px Arial`;
    ctx.fillStyle = '#1a3d4a';
    const {width:txtWidth} = ctx.measureText(el.innerHTML);
    ctx.fillText(el.innerHTML,(canvas.width - txtWidth) / 2, (canvas.height - txtHeight)/2 + txtHeight);
    return canvas.toDataURL();
}

const createFieldShapePreview = (el:HTMLElement) => {
    const canvas = document.createElement('canvas');
    const txtHeight = 36;
    canvas.width = 328;
    canvas.height = txtHeight*1.2;
    const ctx = canvas.getContext('2d');
    if(!ctx){
        throw new Error('no context');
    }
    ctx.fillStyle = '#F3D2B3';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = `${txtHeight}px Arial`;
    ctx.fillStyle = '#1a3d4a';
    ctx.fillText(el.innerHTML,txtHeight/2, (canvas.height - txtHeight)/2 + txtHeight);
    return canvas.toDataURL();
}
const LibraryBase = () => {
    const draggableContainer = React.useRef<HTMLDivElement|null>(null);
    React.useEffect(
        ()=>{
            if(draggableContainer.current){
                miro.board.ui.initDraggableItemsContainer(
                    draggableContainer.current,
                    {
                        draggableItemSelector:'.LibraryShape',
                        onDrop: async (x,y,el)=>{
                            const type = el.getAttribute('data-type');
                            const interEls = await miro.board.widgets.__getIntersectedObjects(
                                {
                                    x: x - 10,
                                    y:y - 10,
                                    width:328 + 20,
                                    height:36 + 20
                                }
                            );
                            let interEl:false|SDK.IShapeWidget = false;
                            if(interEls.length){
                                if(isAppShape(interEls[0])){
                                    interEl = interEls[0] as SDK.IShapeWidget;
                                }
                            }
                            switch(type){
                                case 'database':
                                    await createDatabaseShape({x,y,el});
                                    break;
                                case 'collection':
                                    await createCollectionShape(
                                        {
                                            x,
                                            y,
                                            el,
                                            parent:interEl,
                                            updateParent:interEl? true : false
                                        }
                                    );
                                    break;
                                case 'document':
                                    await createDocumentShape(
                                        {
                                            x,
                                            y,
                                            el,
                                            parent:interEl,
                                            updateParent:interEl? true : false
                                        }
                                    );
                                    break;
                                case 'field':
                                    await createFieldShape(
                                        {
                                            x,
                                            y,
                                            el,
                                            parent:interEl,
                                            updateParent:interEl? true : false
                                        }
                                    );
                                    break;
                                default:
                                    throw new Error('ops');
                                    break;
                            }
                        },
                        getDraggableItemPreview: (el) => {
                            const type = el.getAttribute('data-type');
                            switch(type){
                                case 'database':
                                    return {
                                        url:createDatabaseShapePreview(el)
                                    }
                                    break;
                                case 'collection':
                                    return {
                                        url:createCollectionShapePreview(el)
                                    }
                                    break;
                                case 'document':
                                    return {
                                        url:createDocumentShapePreview(el)
                                    }
                                    break;
                                case 'field':
                                    return {
                                        url:createFieldShapePreview(el)
                                    }
                                    break;
                                default:
                                    throw new Error('ops');
                                    break;
                            }
                        }
                    }
                )
            }
        },
        []
    )
    return(
        <div className='LibraryContainer'>
            <h2 className='.miro-h2'>NoSql</h2>
            <div ref={draggableContainer}>
                <ShapeDatabase/>
                <ShapeCollection/>
                <ShapeDocument/>
                <ShapeField/>
            </div>
        </div>
    )
}

export const Library = React.memo(LibraryBase);
ReactDOM.render(
    <Layout>
        <Library/>
    </Layout>,
	document.getElementById('react-app-library')
)