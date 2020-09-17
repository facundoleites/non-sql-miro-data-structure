import * as React from "react";
import {
  getChildShapes,
  createCollectionShape,
  createDocumentShape,
  createFieldShape,
} from "../../../utils";
import { APP_ID } from "../../../config";
import "./styles.scss";
import { NodeInput } from "../Input";
type NewNodeType = {
  parent: SDK.IShapeWidget;
};
const NodeNewBase: React.FC<NewNodeType> = ({ parent: defaultParent }) => {
  const [parent, setparent] = React.useState(defaultParent);
  const [childs, setchilds] = React.useState<Array<SDK.IShapeWidget>>([]);
  React.useEffect(() => {
    setparent(defaultParent);
  }, [defaultParent, setparent]);
  React.useEffect(() => {
    getChildShapes(parent).then(setchilds);
  }, [parent, setchilds]);

  const isField = React.useMemo(
    () => parent.metadata[APP_ID].type === "field",
    [parent]
  );
  const classes = React.useMemo(() => {
    const currentClasses = ["NewNode"];
    switch (parent.metadata[APP_ID].type) {
      case "collection":
        currentClasses.push("NewNodeCollection");
        break;
      case "document":
        currentClasses.push("NewNodeDocument");
        break;
      case "field":
        currentClasses.push("NewNodeField");
        break;
      case "database":
        currentClasses.push("NewNodeDatabase");
        break;
      default:
        throw new Error("");
        break;
    }
    return currentClasses;
  }, [parent]);

  const [name, setname] = React.useState(
    isField ? (parent.metadata[APP_ID].fieldName as string) : parent.plainText
  );
  const [updating, setupdating] = React.useState(false);
  const [fieldType, setfieldType] = React.useState(
    isField ? (parent.metadata[APP_ID].fieldType as string) : ""
  );
  const typeName = React.useMemo(() => {
    let typeName = "";
    switch (parent.metadata[APP_ID].type) {
      case "database":
        typeName = "Database";
        break;
      case "collection":
        typeName = "Collection";
        break;
      case "document":
        typeName = "Document";
        break;
      case "field":
        typeName = "Field";
        break;
      default:
        throw new Error("");
        break;
    }
    return typeName;
  }, [parent]);

  const handleOnBlurName = React.useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      setupdating(true);
      isField
        ? await miro.board.widgets.update<SDK.IShapeWidget>({
            id: parent.id,
            text: `<p><strong>${name}:</strong> ${fieldType}</p>`,
            metadata: {
              [APP_ID]: {
                ...parent.metadata[APP_ID],
                fieldName: name,
                fieldType: fieldType,
              },
            },
          })
        : await miro.board.widgets.update<SDK.IShapeWidget>({
            id: parent.id,
            text: e.target.value,
          });
      setupdating(false);
    },
    [fieldType, isField, parent, setupdating, name]
  );

  const handleOnChangeFieldType = React.useCallback(
    async (e: React.FocusEvent<HTMLSelectElement>) => {
      if (isField) {
        setupdating(true);
        //type
        setfieldType(e.target.value);
        await miro.board.widgets.update<SDK.IShapeWidget>({
          id: parent.id,
          text: `<p><strong>${name}:</strong> ${e.target.value}</p>`,
          metadata: {
            [APP_ID]: {
              ...parent.metadata[APP_ID],
              fieldName: name,
              fieldType: e.target.value,
            },
          },
        });
        setupdating(false);
      }
    },
    [isField, parent, setfieldType, setupdating, name]
  );
  return (
    <article className={classes.join(" ")}>
      <h2 className="miro-h2">{typeName}</h2>
      {updating ? (
        <input
          value="updating..."
          className="miro-input miro-input--primary"
          placeholder="updating"
          disabled
          style={{
            width: "100%",
          }}
        />
      ) : (
        <NodeInput
          name={name}
          fieldType={fieldType}
          node={parent}
          onBlurName={handleOnBlurName}
          onChangeName={(e) => {
            setname(e.target.value);
          }}
          onChangeFieldType={handleOnChangeFieldType}
        />
      )}
      <h3 className="miro-h3">Childrens</h3>
      <AddChildrenNodeCard
        parent={parent}
        onAdd={(addedChild) => {
          setchilds((currentChilds) => {
            const newChilds = [...currentChilds];
            newChilds.unshift(addedChild);
            return newChilds;
          });
        }}
      />
      {childs.map((thisChild) => (
        <EditNodeCard key={`child_key_${thisChild.id}`} node={thisChild} />
      ))}
    </article>
  );
};
export const NodeNew = React.memo(NodeNewBase);

type EditNodeCardType = {
  node: SDK.IShapeWidget;
};
const EditNodeCardBase: React.FC<EditNodeCardType> = ({ node }) => {
  const isField = React.useMemo(() => node.metadata[APP_ID].type === "field", [
    node,
  ]);
  const [name, setname] = React.useState(() =>
    isField ? (node.metadata[APP_ID].fieldName as string) : node.plainText
  );
  const [updating, setupdating] = React.useState(false);
  const [fieldType, setfieldType] = React.useState(
    isField ? (node.metadata[APP_ID].fieldType as string) : ""
  );
  const typeName = React.useMemo(() => {
    let thisTypeName = "";
    switch (node.metadata[APP_ID].type) {
      case "database":
        thisTypeName = "Database";
        break;
      case "collection":
        thisTypeName = "Collection";
        break;
      case "document":
        thisTypeName = "Document";
        break;
      case "field":
        thisTypeName = "Field";
        break;
      default:
        throw new Error("");
        break;
    }
    return thisTypeName;
  }, [node]);
  const handleOnBlurName = React.useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      setupdating(true);
      isField
        ? await miro.board.widgets.update<SDK.IShapeWidget>({
            id: node.id,
            text: `<p><strong>${name}:</strong> ${fieldType}</p>`,
            metadata: {
              [APP_ID]: {
                ...node.metadata[APP_ID],
                fieldName: name,
                fieldType: fieldType,
              },
            },
          })
        : await miro.board.widgets.update<SDK.IShapeWidget>({
            id: node.id,
            text: e.target.value,
          });
      setupdating(false);
    },
    [fieldType, isField, node, setupdating, name]
  );

  const handleOnChangeFieldType = React.useCallback(
    async (e: React.FocusEvent<HTMLSelectElement>) => {
      if (isField) {
        setupdating(true);
        //type
        setfieldType(e.target.value);
        await miro.board.widgets.update<SDK.IShapeWidget>({
          id: node.id,
          text: `<p><strong>${name}:</strong> ${e.target.value}</p>`,
          metadata: {
            [APP_ID]: {
              ...node.metadata[APP_ID],
              fieldName: name,
              fieldType: e.target.value,
            },
          },
        });
        setupdating(false);
      }
    },
    [isField, node, setfieldType, setupdating, name]
  );
  return (
    <div className="NewNodeEdit">
      <div className="NewNodeEditLabel">{typeName}</div>
      <div className="NewNodeEditInput">
        {updating ? (
          <input
            value="updating..."
            className="miro-input miro-input--primary"
            placeholder="updating"
            disabled
            style={{
              width: "100%",
            }}
          />
        ) : (
          <NodeInput
            name={name}
            fieldType={fieldType}
            node={node}
            onBlurName={handleOnBlurName}
            onChangeName={(e) => setname(e.target.value)}
            onChangeFieldType={handleOnChangeFieldType}
          />
        )}
      </div>
    </div>
  );
};
const EditNodeCard = React.memo(EditNodeCardBase);

type AddChildrenNodeCardType = {
  parent: SDK.IShapeWidget;
  onAdd: (addedChildren: SDK.IShapeWidget) => void;
};
const AddChildrenNodeCardBase: React.FC<AddChildrenNodeCardType> = ({
  parent,
  onAdd,
}) => {
  const [type, settype] = React.useState<
    "field" | "document" | "collection" | "database"
  >("field");
  const isField = React.useMemo(() => type === "field", [type]);
  const [name, setname] = React.useState("");
  const [adding, setadding] = React.useState(false);
  const [fieldType, setfieldType] = React.useState("string");
  const handleOnSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setadding(true);
      let createdShape: SDK.IShapeWidget | false = false;
      switch (type) {
        case "field":
          createdShape = await createFieldShape({
            x: parent.x,
            y: parent.y,
            text: String(name),
            parent: parent,
            type: fieldType,
          });
          break;
        case "document":
          createdShape = await createDocumentShape({
            x: parent.x,
            y: parent.y,
            text: String(name),
            parent: parent,
          });
          break;
        case "collection":
          createdShape = await createCollectionShape({
            x: parent.x,
            y: parent.y,
            text: String(name),
            parent: parent,
          });
          break;
        default:
          throw new Error("");
          break;
      }
      if (createdShape) {
        onAdd(createdShape);
      }
      setadding(false);
    },
    [parent, onAdd, type, name, fieldType, setadding]
  );
  return (
    <form onSubmit={handleOnSubmit}>
      <div className="NewNodeAddChildren">
        {adding ? (
          <input
            value="adding..."
            className="miro-input miro-input--primary"
            placeholder="adding"
            disabled
            style={{
              width: "100%",
            }}
          />
        ) : (
          <>
            <div className="NewNodeAddChildrenLabel">
              <select
                className="miro-select miro-select--secondary-bordered"
                value={type}
                onChange={(e) => settype(e.target.value as any)}
                style={{
                  width: "100%",
                }}
              >
                <option>collection</option>
                <option>document</option>
                <option>field</option>
              </select>
            </div>
            <div className="NewNodeAddChildrenInput">
              <NodeInput
                field={isField}
                name={name}
                fieldType={fieldType}
                onChangeName={(e) => setname(e.target.value)}
                onChangeFieldType={(e) => setfieldType(e.target.value)}
              />
            </div>
            <div className="NewNodeAddChildrenButton">
              <button
                className="miro-btn miro-btn--primary"
                style={{
                  width: "100%",
                }}
              >
                add
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
};
const AddChildrenNodeCard = React.memo(AddChildrenNodeCardBase);
