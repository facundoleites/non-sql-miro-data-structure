import { APP_ID } from "./config";
import PromisePool from "es6-promise-pool";

export const isAppShape = (shape: SDK.IWidget) => {
  if (shape.type !== "SHAPE") {
    return false;
  }
  if (!shape.metadata[APP_ID] || !shape.metadata[APP_ID].type) {
    return false;
  }
  return true;
};
export const getLines = (shape: SDK.IWidget) =>
  miro.board.widgets.get<SDK.ILineWidget>({
    type: "LINE",
    startWidgetId: shape.id,
  });

export const getChildShapes = async (shape: SDK.IWidget) => {
  const lines = await getLines(shape);
  if (!lines.length) {
    return [];
  }
  const promises = lines.map((l) =>
    miro.board.widgets.get<SDK.IShapeWidget>({
      type: "SHAPE",
      id: l.endWidgetId,
    })
  );
  const allShapes = await Promise.all(promises);
  return orderShapesByMetaType(
    allShapes.reduce((prev, current) => {
      return [...prev, current[0]];
    })
  );
};

const orderShapesByMetaType = (shapes: Array<SDK.IShapeWidget>) => {
  return [...shapes].sort((a, b) => {
    if (a.metadata[APP_ID].type === "collection") {
      if (b.metadata[APP_ID].type === "field") {
        return 1;
      } else if (b.metadata[APP_ID].type === "document") {
        return 1;
      }
      return -1;
    } else if (a.metadata[APP_ID].type === "field") {
      if (b.metadata[APP_ID].type === "collection") {
        return 1;
      } else if (b.metadata[APP_ID].type === "document") {
        return 1;
      }
      return -1;
    }
    return 0;
  });
};

export const updateChildsPos = async (
  parent: SDK.IShapeWidget,
  childs: Array<SDK.IShapeWidget>,
  startY: number
) => {
  let currentI = 0;
  let minY = startY;
  const creator = () => {
    if (currentI > childs.length - 1) {
      return null;
    }
    const child = childs[currentI];
    const targetX = parent.bounds.right + 10 + 328;
    const targetY = currentI ? 20 + minY + child.bounds.height / 2 : minY;
    return new Promise((resolve) => {
      resolve(true);
    })
      .then(() => {
        if (child.x === targetX && child.y === targetY) {
          return;
        }
        return miro.board.widgets.update<SDK.IShapeWidget>({
          id: child.id,
          x: targetX,
          y: targetY,
        });
      })
      .then((widgets) => {
        const widget = widgets ? widgets[0] : child;
        minY = widget.bounds.bottom;
        return updateShape(child, minY);
      })
      .then(({ minY: newMiny }) => {
        minY = newMiny;
        currentI++;
        return minY;
      })
      .catch((e) => {
        currentI++;
        return minY;
      });
  };
  const pool = new PromisePool(creator as any, 1);
  try {
    await pool.start();
    return minY;
  } catch (e) {
    return false;
  }
};
export const updateShape = async (
  shape: SDK.IShapeWidget,
  minY: number = 0
) => {
  const childs = await getChildShapes(shape);
  const orderedByType = orderShapesByMetaType(childs);
  const orderByPos = [...orderedByType].sort((a, b) => a.bounds.y - b.bounds.y);
  const newMinY = await updateChildsPos(
    shape,
    orderByPos,
    minY || shape.metadata[APP_ID].ChildsTop || shape.bounds.y
    //shape.metadata[APP_ID].ChildsTop || minY || shape.bounds.y
  );
  const updatedChilds = await getChildShapes(shape);
  const updatedorderByPos = [...updatedChilds].sort(
    (a, b) => a.bounds.y - b.bounds.y
  );
  const bottomestChild = [...updatedorderByPos].pop();
  const toppestChild = [...updatedorderByPos].shift();
  if (
    bottomestChild &&
    bottomestChild.bounds &&
    bottomestChild.bounds.y &&
    toppestChild &&
    toppestChild.bounds &&
    toppestChild.bounds.y
  ) {
    let targetY = shape.y;
    if (toppestChild.y !== bottomestChild.y) {
      const centerOfChilds =
        (bottomestChild.bounds.bottom - toppestChild.bounds.top) / 2 +
        toppestChild.bounds.top;
      targetY = centerOfChilds;
    } else {
      targetY = toppestChild.y;
    }
    await miro.board.widgets.update({
      id: shape.id,
      y: targetY,
      metadata: {
        [APP_ID]: {
          ...shape.metadata[APP_ID],
          ChildsTop: toppestChild.bounds.top,
          ChildsBottom: bottomestChild.bounds.bottom,
        },
      },
    });
  }
  return { minY: Number(newMinY) };
};

export const getIntersectedObjects = ({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  return miro.board.widgets.__getIntersectedObjects({
    x,
    y,
    width,
    height,
  });
};

//shapes

export const createFieldShape = async (params: {
  x: number;
  y: number;
  el?: HTMLElement;
  text?: string;
  type?: string;
  parent?: SDK.IWidget | false;
  updateParent?: boolean;
}): Promise<SDK.IShapeWidget> => {
  const { x, y, el, text, type = "string", parent, updateParent } = params;
  const targetY = y;
  const parentShape = parent as SDK.IShapeWidget;
  const targetX = parentShape ? parentShape.bounds.right + 328 + 10 : x;
  const fieldCreated = await miro.board.widgets.create<SDK.IShapeWidget>({
    type: "shape",
    x: targetX,
    y: targetY,
    rotation: 0.0,
    width: 328,
    height: 36,
    style: {
      backgroundColor: "#F3D2B3",
      backgroundOpacity: 1,
      borderWidth: 0,
      textAlign: "l",
      borderStyle: "none",
      fontSize: 24,
      shapeType: 7,
      textColor: "#1a3d4a",
    },
    text: `<p><strong>${el?.innerHTML || text}</strong>: ${type}</p>`,
    capabilities: {
      editable: false,
    },
    metadata: metadata({
      parent: parent ? parent?.id : false,
      type: "field",
      fieldName: el?.innerHTML || text,
      fieldType: type,
    }),
  });
  if (parent) {
    let lineColor;
    switch (parent.metadata[APP_ID].type) {
      case "collection":
        lineColor = "#F38C8D";
        break;
      case "document":
        lineColor = "#F2B8A2";
        break;
      case "field":
        lineColor = "#F3D2B3";
        break;
      default:
        throw new Error("error");
        break;
    }
    await miro.board.widgets.create<SDK.ILineWidget>({
      type: "LINE",
      startWidgetId: parent.id,
      endWidgetId: fieldCreated[0].id,
      capabilities: {
        editable: false,
      },
      style: {
        lineColor,
        lineStartStyle: 0,
        lineEndStyle: 1,
        lineStyle: 2,
        lineThickness: 2,
        lineType: 2,
      },
    });
    if (updateParent) {
      await updateShape(parent as SDK.IShapeWidget);
    }
  }
  return fieldCreated[0];
};

export const createDocumentShape = async ({
  x,
  y,
  el,
  text,
  parent,
  updateParent,
}: {
  x: number;
  y: number;
  el?: HTMLElement;
  text?: string;
  parent?: SDK.IWidget | false;
  updateParent?: boolean;
}): Promise<SDK.IShapeWidget> => {
  const targetY = y;
  const parentShape = parent as SDK.IShapeWidget;
  const targetX = parentShape ? parentShape.bounds.right + 328 + 10 : x;
  const createdDocument = await miro.board.widgets.create<SDK.IShapeWidget>({
    type: "shape",
    x: targetX,
    y: targetY,
    rotation: 0.0,
    width: 328,
    height: 48,
    groupId: "teste",
    style: {
      backgroundColor: "#F2B8A2",
      fontSize: 36,
      borderWidth: 0,
      textAlign: "c",
      shapeType: 7,
      textColor: "#1a3d4a",
    },
    text: `<p>${el?.innerHTML || text}</p>`,
    capabilities: {
      editable: false,
    },
    metadata: metadata({
      parent: parent ? parent?.id : false,
      type: "document",
    }),
  });
  const documentId = createdDocument[0].id;
  await createFieldShape({
    x,
    y: y + 48 * 1.2,
    text: "field",
    parent: createdDocument[0],
  });
  if (parent) {
    let lineColor;
    switch (parent.metadata[APP_ID].type) {
      case "collection":
        lineColor = "#F38C8D";
        break;
      case "document":
        lineColor = "#F2B8A2";
        break;
      case "field":
        lineColor = "#F3D2B3";
        break;
      default:
        throw new Error("error");
        break;
    }
    await miro.board.widgets.create({
      type: "LINE",
      startWidgetId: parent.id,
      endWidgetId: documentId,
      capabilities: {
        editable: false,
      },
      style: {
        lineColor,
        lineStartStyle: 0,
        lineEndStyle: 1,
        lineStyle: 2,
        lineThickness: 6,
        lineType: 2,
      },
    });
    if (updateParent) {
      await updateShape(parent as SDK.IShapeWidget);
    }
  }
  /*if(!updateParent){
        await updateShape(createdDocument[0],true);
    }*/
  return createdDocument[0];
};

export const createCollectionShape = async ({
  x,
  y,
  el,
  text,
  parent,
  updateParent,
}: {
  x: number;
  y: number;
  el?: HTMLElement;
  text?: string;
  parent?: SDK.IWidget | false;
  updateParent?: boolean;
}) => {
  const targetY = y;
  const parentShape = parent as SDK.IShapeWidget;
  const targetX = parentShape ? parentShape.bounds.right + 328 + 10 : x;
  const createdCollection = await miro.board.widgets.create<SDK.IShapeWidget>({
    type: "shape",
    x: targetX,
    y: targetY,
    rotation: 0.0,
    width: 328,
    height: 56,
    style: {
      backgroundColor: "#F38C8D",
      fontSize: 48,
      borderWidth: 0,
      textAlign: "c",
      shapeType: 7,
      textColor: "#1a3d4a",
    },
    capabilities: {
      editable: false,
    },
    groupId: "teste",
    text: `<p>${el?.innerHTML || text}</p>`,
    metadata: metadata({
      parent: parent ? parent?.id : false,
      type: "collection",
    }),
  });
  const collectionId = createdCollection[0].id;
  await createDocumentShape({
    x,
    y: y + 56 * 1.2,
    text: "document",
    parent: createdCollection[0],
  });
  if (parent) {
    let lineColor;
    switch (parent.metadata[APP_ID].type) {
      case "database":
        lineColor = "#1a3d4a";
        break;
      case "collection":
        lineColor = "#F38C8D";
        break;
      case "document":
        lineColor = "#F2B8A2";
        break;
      case "field":
        lineColor = "#F3D2B3";
        break;
      default:
        throw new Error("error");
        break;
    }
    await miro.board.widgets.create<SDK.IShapeWidget>({
      type: "LINE",
      startWidgetId: parent.id,
      endWidgetId: collectionId,
      capabilities: {
        editable: false,
      },
      style: {
        lineColor,
        lineStartStyle: 0,
        lineEndStyle: 1,
        lineThickness: 4,
        lineStyle: 2,
        lineType: 2,
      },
    });
    if (updateParent) {
      await updateShape(parent as SDK.IShapeWidget);
    }
  }
  /*if(!updateParent){
        await updateShape(createdCollection[0],true);
    }*/
  return createdCollection[0];
};

export const createDatabaseShape = async ({
  x,
  y,
  el,
  text,
}: {
  x: number;
  y: number;
  el?: HTMLElement;
  text?: string;
}) => {
  const targetY = y;
  const targetX = x;
  const createdDatabase = await miro.board.widgets.create<SDK.IShapeWidget>({
    type: "shape",
    x: targetX,
    y: targetY,
    rotation: 0.0,
    width: 328,
    height: 56,
    style: {
      backgroundColor: "#1a3d4a",
      fontSize: 48,
      borderWidth: 0,
      textAlign: "c",
      shapeType: 7,
      textColor: "#F38C8D",
    },
    groupId: "teste",
    text: `<p>${el?.innerHTML || text}</p>`,
    capabilities: {
      editable: false,
    },
    metadata: metadata({
      type: "database",
    }),
  });
  await createCollectionShape({
    x,
    y: y + 56 * 1.2,
    text: "collection",
    parent: createdDatabase[0],
  });
  await updateShape(createdDatabase[0]);
  return createdDatabase[0];
};

export const metadata = (metadata: any) => {
  return {
    [APP_ID]: {
      ...metadata,
    },
  };
};
