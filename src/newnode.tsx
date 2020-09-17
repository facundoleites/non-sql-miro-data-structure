import * as React from "react";
import * as ReactDOM from "react-dom";
import { APP_ID } from "./config";
import { Layout } from "./layouts/Layout";
import { NodeNew } from "./components/Node/New";
const NewNodeModalBase = () => {
  const [shapeId, setShapeId] = React.useState<null | string>(null);
  const [shape, setShape] = React.useState<null | SDK.IShapeWidget>(null);
  React.useEffect(() => {
    const handleSelection = (e: SDK.Event) => {
      if (e.data.length !== 1) {
        return setShapeId(null);
      }
      if (!e.data[0].metadata[APP_ID]?.type) {
        return setShapeId(null);
      }
      return setShapeId(e.data[0].id);
    };

    miro.board.selection.get().then((selections) => {
      if (selections.length !== 1) {
        return setShapeId(null);
      }
      if (!selections[0].metadata[APP_ID]?.type) {
        return setShapeId(null);
      }
      return setShapeId(selections[0].id);
    });

    miro.addListener(miro.enums.event.SELECTION_UPDATED, handleSelection);
    return () => {
      miro.removeListener(miro.enums.event.SELECTION_UPDATED, handleSelection);
    };
  }, [setShapeId]);
  React.useEffect(() => {
    if (!shapeId) {
      setShape(null);
    }
    miro.board.widgets
      .get<SDK.IShapeWidget>({
        id: shapeId,
      })
      .then((shapes) => {
        const shapeObj = shapes[0];
        setShape(shapeObj);
      })
      .catch((e) => {
        setShape(null);
      });
  }, [shapeId, setShape]);
  return (
    <>
      <h1 className="miro-h1">node</h1>
      {shape ? <NodeNew parent={shape} /> : null}
    </>
  );
};

export const NewNodeModal = React.memo(NewNodeModalBase);

const NewModalContainer = React.memo(() => (
  <Layout>
    <NewNodeModal />
  </Layout>
));
ReactDOM.render(
  <NewModalContainer />,
  document.getElementById("react-app-modal-node")
);
