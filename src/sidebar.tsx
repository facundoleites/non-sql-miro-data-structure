import * as React from "react";
import * as ReactDOM from "react-dom";
import { APP_ID } from "./config";
import { Layout } from "./layouts/Layout";
import { NodeCard } from "./components/Node/Card";
const SidebarBase = () => {
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
        console.error(e);
        setShape(null);
      });
  }, [shapeId, setShape]);
  return (
    <Layout>
      <h1 className="miro-h1">Sidebar</h1>
      <h1 className="miro-h2">Edit node</h1>
      {shape ? (
        <NodeCard fetchChildrens={true} recursive={false} node={shape} />
      ) : (
        <p className="miro-p-medium">Select an node first</p>
      )}
    </Layout>
  );
};

export const Sidebar = React.memo(SidebarBase);
ReactDOM.render(<Sidebar />, document.getElementById("react-app-sidebar"));
