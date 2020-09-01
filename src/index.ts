import { APP_ID } from "./config";
import { updateShape } from "./utils";

const icon24 = '<path fill="currentColor" d="M4,14V17C4,19 7.05,20.72 11,21V18.11L11.13,18C7.12,17.76 4,16.06 4,14M12,13C7.58,13 4,11.21 4,9V12C4,14.21 7.58,16 12,16C12.39,16 12.77,16 13.16,16L17,12.12C15.4,12.72 13.71,13 12,13M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M21,11.13C20.85,11.13 20.71,11.19 20.61,11.3L19.61,12.3L21.66,14.3L22.66,13.3C22.87,13.1 22.88,12.76 22.66,12.53L21.42,11.3C21.32,11.19 21.18,11.13 21.04,11.13M19.04,12.88L13,18.94V21H15.06L21.12,14.93L19.04,12.88Z" />';
const icon48 = '<path fill="#5B00FF" d="M4,14V17C4,19 7.05,20.72 11,21V18.11L11.13,18C7.12,17.76 4,16.06 4,14M12,13C7.58,13 4,11.21 4,9V12C4,14.21 7.58,16 12,16C12.39,16 12.77,16 13.16,16L17,12.12C15.4,12.72 13.71,13 12,13M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M21,11.13C20.85,11.13 20.71,11.19 20.61,11.3L19.61,12.3L21.66,14.3L22.66,13.3C22.87,13.1 22.88,12.76 22.66,12.53L21.42,11.3C21.32,11.19 21.18,11.13 21.04,11.13M19.04,12.88L13,18.94V21H15.06L21.12,14.93L19.04,12.88Z" />';
const iconAlign = '<path fill="currentColor" d="M5 20V13H2V11H5V4H11V11H13V7H19V11H22V13H19V17H13V13H11V20H5Z" />';
console.log("icon24", icon24)
miro.onReady(
    ()=>{
        miro.initialize(
            {
                extensionPoints: {
                    bottomBar: {
                        title: 'nonSql model',
                        svgIcon:icon24,
                        onClick: () => {
                            miro.board.ui.openLeftSidebar('sidebar.html');
                        }
                    },
                    toolbar: {
                        title: 'nonSQL model',
                        toolbarSvgIcon: icon24,
                        librarySvgIcon: icon48,
                        onClick: () => {
                            miro.board.ui.openLibrary('library.html',{title:'NoSql'});
                        }
                    },
                    getWidgetMenuItems: (widgets) => {
                        const supportedWidgetsInSelection = widgets.filter(
                            widget => widget.type === 'SHAPE' && widget.metadata[APP_ID] && widget.metadata[APP_ID].type
                        );
                        // All selected widgets have to be supported in order to show the menu
                        if(supportedWidgetsInSelection.length == widgets.length){
                            return Promise.resolve(
                                [
                                    {
                                        tooltip: 'align',
                                        svgIcon: iconAlign,
                                        onClick: async () => {
                                            miro.board.ui.openModal(
                                                'loading.html',
                                                {
                                                    width:300,
                                                    height:100
                                                }
                                            );
                                            await updateShape(widgets[0] as SDK.IShapeWidget);
                                            miro.board.ui.closeModal();
                                        }
                                    },
                                    {
                                        tooltip: 'edit',
                                        svgIcon: icon24,
                                        onClick: () => {
                                            miro.board.ui.openModal(
                                                'newnode.html'
                                            )
                                        }
                                    }
                                ]
                            )
                        }
                        // Not all selected widgets are supported, we won't show the menu
                        return Promise.resolve([]);
                    }
                }
            }
        )
    }
)