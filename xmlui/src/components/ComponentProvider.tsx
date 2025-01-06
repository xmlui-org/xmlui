import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type {
  ComponentRendererDef,
  CompoundComponentRendererInfo,
} from "@abstractions/RendererDefs";
import {
  chStackComponentRenderer,
  cvStackComponentRenderer,
  hStackComponentRenderer,
  stackComponentRenderer,
  vStackComponentRenderer,
} from "@components/Stack/Stack";
import { spaceFillerComponentRenderer } from "@components/SpaceFiller/SpaceFiller";
import { textAreaComponentRenderer } from "@components/TextArea/TextArea";
import { navLinkComponentRenderer } from "@components/NavLink/NavLink";
import { localLinkComponentRenderer } from "@components/Link/Link";
import { treeComponentRenderer } from "@components/Tree/TreeComponent";
import { buttonComponentRenderer } from "@components/Button/Button";
import {
  h1ComponentRenderer,
  h2ComponentRenderer,
  h3ComponentRenderer,
  h4ComponentRenderer,
  h5ComponentRenderer,
  h6ComponentRenderer,
  headingComponentRenderer,
} from "@components/Heading/Heading";
import { textComponentRenderer } from "@components/Text/Text";
import { fragmentComponentRenderer } from "@components-core/Fragment";
import { tableComponentRenderer } from "@components/Table/Table";
import { stickyBoxComponentRenderer } from "@components/StickyBox/StickyBox";
import { badgeComponentRenderer } from "@components/Badge/Badge";
import { avatarComponentRenderer } from "@components/Avatar/Avatar";
import { contentSeparatorComponentRenderer } from "@components/ContentSeparator/ContentSeparator";
import { cardComponentRenderer } from "@components/Card/Card";
import { flowLayoutComponentRenderer } from "@components/FlowLayout/FlowLayout";
import { modalViewComponentRenderer } from "@components/ModalDialog/ModalDialog";
import { noResultComponentRenderer } from "@components/NoResult/NoResult";
import { fileUploadDropZoneComponentRenderer } from "@components/FileUploadDropZone/FileUploadDropZone";
import { iconComponentRenderer } from "@components/Icon/Icon";
import { itemsComponentRenderer } from "@components/Items/Items";
import { selectionStoreComponentRenderer } from "@components/SelectionStore/SelectionStore";
import { imageComponentRenderer } from "@components/Image/Image";
import { pageMetaTitleComponentRenderer } from "@components/PageMetaTitle/PageMetaTitle";
import { progressBarComponentRenderer } from "@components/ProgressBar/ProgressBar";
import {
  hSplitterComponentRenderer,
  splitterComponentRenderer,
  vSplitterComponentRenderer,
} from "@components/Splitter/Splitter";
import { queueComponentRenderer } from "@components/Queue/Queue";
import { CompoundComponent } from "@components-core/CompoundComponent";
import type { ContributesDefinition } from "@components-core/RootComponent";
import { dynamicHeightListComponentRenderer } from "@components/List/List";
import { positionedContainerComponentRenderer } from "@components/PositionedContainer/PositionedContainer";
import { changeListenerComponentRenderer } from "@components/ChangeListener/ChangeListener";
import { formItemComponentRenderer } from "@components/FormItem/FormItem";
import {
  passwordInputComponentRenderer,
  textBoxComponentRenderer,
} from "@components/TextBox/TextBox";
import { realTimeAdapterComponentRenderer } from "@components/RealTimeAdapter/RealTimeAdapter";
import { formComponentRenderer } from "@components/Form/Form";
import { emojiSelectorRenderer } from "@components/EmojiSelector/EmojiSelector";
import { numberBoxComponentRenderer } from "@components/NumberBox/NumberBox";
import { hoverCardComponentRenderer } from "@components/HoverCard/HoverCard";
import { appRenderer } from "@components/App/App";
import { navPanelRenderer } from "@components/NavPanel/NavPanel";
import { pageRenderer, pagesRenderer } from "@components/Pages/Pages";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { footerRenderer } from "@components/Footer/Footer";
import { navGroupComponentRenderer } from "@components/NavGroup/NavGroup";
import { logoComponentRenderer } from "@components/Logo/Logo";
import { radioGroupRenderer } from "@components/RadioGroup/RadioGroup";
import { SlotHolder } from "@components-core/Slot";
import { fileInputRenderer } from "@components/FileInput/FileInput";
import { chartRenderer } from "@components/Chart/Chart";
import { spinnerComponentRenderer } from "@components/Spinner/Spinner";
import { markdownComponentRenderer } from "@components/Markdown/Markdown";
import { selectComponentRenderer } from "@components/Select/Select";
import { themeChangerButtonComponentRenderer } from "@components/ThemeChanger/ThemeChanger";
import { formSectionRenderer } from "@components/FormSection/FormSection";
import { checkboxComponentRenderer } from "@components/Checkbox/Checkbox";
import { switchComponentRenderer } from "@components/Switch/Switch";
import { appHeaderComponentRenderer } from "@components/AppHeader/AppHeader";
import {
  dropdownMenuComponentRenderer,
  menuItemRenderer,
  menuSeparatorRenderer,
  subMenuItemRenderer,
} from "@components/DropdownMenu/DropdownMenu";
import { themeComponentRenderer } from "@components/Theme/Theme";
import { merge } from "lodash-es";
import type { ComponentRegistryEntry } from "@components/ComponentRegistryContext";
import { ComponentRegistryContext } from "@components/ComponentRegistryContext";
import { columnComponentRenderer } from "@components/Column/Column";
import type { ActionFunction, ActionRendererDef } from "@abstractions/ActionDefs";
import { apiAction } from "@components-core/action/APICall";
import { downloadAction } from "@components-core/action/FileDownloadAction";
import { uploadAction } from "@components-core/action/FileUploadAction";
import { navigateAction } from "@components-core/action/NavigateAction";
import { timedAction } from "@components-core/action/TimedAction";
import type {
  LoaderRenderer,
  LoaderRendererDef,
} from "@components-core/abstractions/LoaderRenderer";
import { apiLoaderRenderer } from "@components-core/loader/ApiLoader";
import { externalDataLoaderRenderer } from "@components-core/loader/ExternalDataLoader";
import { mockLoaderRenderer } from "@components-core/loader/MockLoaderRenderer";
import { dataLoaderRenderer } from "@components-core/loader/DataLoader";
import { datePickerComponentRenderer } from "@components/DatePicker/DatePicker";
import { redirectRenderer } from "@components/Redirect/Redirect";
import { pieChartComponentRenderer } from "@components/PieChart/PieChart";
import { barChartComponentRenderer } from "@components/BarChart/BarChart";
import { mapComponentRenderer } from "@components/Map/Map";
import { tabsComponentRenderer } from "@components/Tabs/Tabs";
import { bookmarkComponentRenderer } from "@components/Bookmark/Bookmark";
import { appStateComponentRenderer } from "@components/AppState/AppState";
import { pageHeaderRenderer } from "./PageHeader/PageHeader";
import { trendLabelRenderer } from "./TrendLabel/TrendLabel";
import { iconInfoCardRenderer } from "./IconInfoCard/IconInfoCard";
import { tableHeaderRenderer } from "./TableHeader/TableHeader";
import { toolbarRenderer } from "./Toolbar/Toolbar";
import { toolbarButtonRenderer } from "./ToolbarButton/ToolbarButton";
import { tableOfContentsRenderer } from "@components/TableOfContents/TableOfContents";
import { accordionComponentRenderer } from "./Accordion/Accordion";
import { alertComponentRenderer } from "./Alert/Alert";
import { offCanvasComponentRenderer } from "./OffCanvas/OffCanvas";
import { codeComponentRenderer } from "@components-core/XmluiCodeHighlighter";
import { tabItemComponentRenderer } from "@components/Tabs/TabItem";
import { rangeComponentRenderer } from "./Range/Range";
import { accordionItemComponentRenderer } from "@components/Accordion/AccordionItem";
import { sliderComponentRenderer } from "./Slider/Slider";
import { buttonGroupComponentRenderer } from "./ButtonGroup/ButtonGroup";
import { carouselComponentRenderer } from "@components/Carousel/Carousel";
import { carouselItemComponentRenderer } from "@components/Carousel/CarouselItem";
import { createPropHolderComponent } from "@components-core/renderers";
import { breakoutComponentRenderer } from "@components/Breakout/Breakout";
import { toneChangerButtonComponentRenderer } from "@components/ThemeChanger/ToneChangerButton";
import { apiCallRenderer } from "@components/APICall/APICall";
import { optionComponentRenderer } from "@components/Option/Option";
import { autoCompleteComponentRenderer } from "@components/AutoComplete/AutoComplete";
import type StandaloneComponentManager from "../StandaloneComponentManager";

/**
 * The framework has a specialized component concept, the "property holder 
 * component." These components only hold property values but do not render 
 * anything. The framework processes each of them in a particular way. 
 * 
 * The property holder components must be registered along with other 
 * components, as apps may use them in their markup. The following constant 
 * values declare renderer functions for the built-in property holders.
 */
const dataSourcePropHolder = createPropHolderComponent("DataSource");
const textNodePropHolder = createPropHolderComponent("TextNode");
const textNodeCDataPropHolder = createPropHolderComponent("TextNodeCData");

/**
 * This class implements the registry that holds the components available 
 * in xmlui. Any component in this registry can be used in the xmlui markup. 
 * An error is raised when the markup processor does not find a particular 
 * component within the registry.
 * 
 * 
 */
export class ComponentRegistry {
  // --- The pool of available components
  private pool = new Map<string, ComponentRegistryEntry>();

  // --- The pool of available theme variable names
  private themeVars = new Set<string>();
  private defaultThemeVars = {};
  private actionFns = new Map<string, ActionFunction>();
  // --- The pool of available loader renderers
  private loaders = new Map<string, LoaderRenderer<any>>();
  private componentManager: StandaloneComponentManager = undefined;

  constructor(
    contributes: ContributesDefinition = {},
    componentManager?: StandaloneComponentManager,
  ) {
    this.componentManager = componentManager;
    if (process.env.VITE_USED_COMPONENTS_Stack !== "false") {
      this.registerComponentRenderer(stackComponentRenderer);
      this.registerComponentRenderer(vStackComponentRenderer);
      this.registerComponentRenderer(hStackComponentRenderer);
      this.registerComponentRenderer(cvStackComponentRenderer);
      this.registerComponentRenderer(chStackComponentRenderer);
    }

    this.registerComponentRenderer(SlotHolder);
    this.registerComponentRenderer(dataSourcePropHolder);
    this.registerComponentRenderer(textNodePropHolder);
    this.registerComponentRenderer(textNodeCDataPropHolder);
    if (process.env.VITE_USED_COMPONENTS_SpaceFiller !== "false") {
      this.registerComponentRenderer(spaceFillerComponentRenderer);
    }

    if (process.env.VITE_USED_COMPONENTS_Textarea !== "false") {
      this.registerComponentRenderer(textAreaComponentRenderer);
    }

    if (process.env.VITE_USED_COMPONENTS_AppHeader !== "false") {
      this.registerComponentRenderer(appHeaderComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Footer !== "false") {
      this.registerComponentRenderer(footerRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Logo !== "false") {
      this.registerComponentRenderer(logoComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NavLink !== "false") {
      this.registerComponentRenderer(navLinkComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NavGroup !== "false") {
      this.registerComponentRenderer(navGroupComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Link !== "false") {
      this.registerComponentRenderer(localLinkComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Form !== "false") {
      this.registerComponentRenderer(formComponentRenderer);
      this.registerComponentRenderer(formItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Tree !== "false") {
      this.registerComponentRenderer(treeComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Button !== "false") {
      this.registerComponentRenderer(buttonComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Checkbox !== "false") {
      this.registerComponentRenderer(checkboxComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Switch !== "false") {
      this.registerComponentRenderer(switchComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Heading !== "false") {
      this.registerComponentRenderer(headingComponentRenderer);
      this.registerComponentRenderer(h1ComponentRenderer);
      this.registerComponentRenderer(h2ComponentRenderer);
      this.registerComponentRenderer(h3ComponentRenderer);
      this.registerComponentRenderer(h4ComponentRenderer);
      this.registerComponentRenderer(h5ComponentRenderer);
      this.registerComponentRenderer(h6ComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Text !== "false") {
      this.registerComponentRenderer(textComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Fragment !== "false") {
      this.registerComponentRenderer(fragmentComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Table !== "false") {
      this.registerComponentRenderer(tableComponentRenderer);
      this.registerComponentRenderer(columnComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_List !== "false") {
      this.registerComponentRenderer(dynamicHeightListComponentRenderer);
    }

    if (process.env.VITE_USED_COMPONENTS_App !== "false") {
      this.registerComponentRenderer(appRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NavPanel !== "false") {
      this.registerComponentRenderer(navPanelRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Pages !== "false") {
      this.registerComponentRenderer(pagesRenderer);
      this.registerComponentRenderer(pageRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Redirect !== "false") {
      this.registerComponentRenderer(redirectRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_StickyBox !== "false") {
      this.registerComponentRenderer(stickyBoxComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Badge !== "false") {
      this.registerComponentRenderer(badgeComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Avatar !== "false") {
      this.registerComponentRenderer(avatarComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_ContentSeparator !== "false") {
      this.registerComponentRenderer(contentSeparatorComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Card !== "false") {
      this.registerComponentRenderer(cardComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_FlowLayout !== "false") {
      this.registerComponentRenderer(flowLayoutComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_ModalDialog !== "false") {
      this.registerComponentRenderer(modalViewComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NoResult !== "false") {
      this.registerComponentRenderer(noResultComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Option !== "false") {
      this.registerComponentRenderer(optionComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_TabItem !== "false") {
      this.registerComponentRenderer(tabItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_AccordionItem !== "false") {
      this.registerComponentRenderer(accordionItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_CarouselItem !== "false") {
      this.registerComponentRenderer(carouselItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_FileUploadDropZone !== "false") {
      this.registerComponentRenderer(fileUploadDropZoneComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Icon !== "false") {
      this.registerComponentRenderer(iconComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Items !== "false") {
      this.registerComponentRenderer(itemsComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_SelectionStore !== "false") {
      this.registerComponentRenderer(selectionStoreComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Image !== "false") {
      this.registerComponentRenderer(imageComponentRenderer);
    }

    if (process.env.VITE_USER_COMPONENTS_XmluiCodeHightlighter !== "false") {
      this.registerComponentRenderer(codeComponentRenderer);
    }

    if (process.env.VITE_USER_COMPONENTS_Markdown !== "false") {
      this.registerComponentRenderer(markdownComponentRenderer);
    }

    if (process.env.VITE_INCLUDE_REST_COMPONENTS !== "false") {
      //TODO, if it proves to be a working solution, make these components skippable, too
      this.registerComponentRenderer(pageMetaTitleComponentRenderer);
      this.registerComponentRenderer(progressBarComponentRenderer);
      this.registerComponentRenderer(splitterComponentRenderer);
      this.registerComponentRenderer(vSplitterComponentRenderer);
      this.registerComponentRenderer(hSplitterComponentRenderer);
      this.registerComponentRenderer(queueComponentRenderer);
      this.registerComponentRenderer(positionedContainerComponentRenderer);
      this.registerComponentRenderer(changeListenerComponentRenderer);
      this.registerComponentRenderer(realTimeAdapterComponentRenderer);
      this.registerComponentRenderer(textBoxComponentRenderer);
      this.registerComponentRenderer(passwordInputComponentRenderer);
      this.registerComponentRenderer(emojiSelectorRenderer);
      this.registerComponentRenderer(numberBoxComponentRenderer);
      this.registerComponentRenderer(hoverCardComponentRenderer);
      this.registerComponentRenderer(radioGroupRenderer);
      this.registerComponentRenderer(fileInputRenderer);
      this.registerComponentRenderer(datePickerComponentRenderer);
      this.registerComponentRenderer(spinnerComponentRenderer);
      this.registerComponentRenderer(selectComponentRenderer);
      this.registerComponentRenderer(autoCompleteComponentRenderer);
      this.registerComponentRenderer(dropdownMenuComponentRenderer);
      this.registerComponentRenderer(themeChangerButtonComponentRenderer);
      this.registerComponentRenderer(toneChangerButtonComponentRenderer);
      this.registerCompoundComponentRenderer(formSectionRenderer);
      this.registerComponentRenderer(dropdownMenuComponentRenderer);
      this.registerComponentRenderer(menuItemRenderer);
      this.registerComponentRenderer(subMenuItemRenderer);
      this.registerComponentRenderer(menuSeparatorRenderer);
      this.registerComponentRenderer(tabsComponentRenderer);
      this.registerComponentRenderer(bookmarkComponentRenderer);
      this.registerComponentRenderer(tableOfContentsRenderer);
      this.registerComponentRenderer(breakoutComponentRenderer);
    }
    this.registerComponentRenderer(themeComponentRenderer);
    this.registerComponentRenderer(appStateComponentRenderer);
    this.registerComponentRenderer(apiCallRenderer);

    // --- Added after tabler-clone review
    this.registerCompoundComponentRenderer(pageHeaderRenderer);
    this.registerCompoundComponentRenderer(trendLabelRenderer);
    this.registerCompoundComponentRenderer(iconInfoCardRenderer);
    this.registerCompoundComponentRenderer(tableHeaderRenderer);
    this.registerCompoundComponentRenderer(toolbarRenderer);
    this.registerCompoundComponentRenderer(toolbarButtonRenderer);

    // --- New Bootstrap-inspired components
    this.registerComponentRenderer(carouselComponentRenderer);
    this.registerComponentRenderer(accordionComponentRenderer);
    this.registerComponentRenderer(alertComponentRenderer);
    this.registerComponentRenderer(offCanvasComponentRenderer);
    this.registerComponentRenderer(rangeComponentRenderer);
    this.registerComponentRenderer(sliderComponentRenderer);
    this.registerComponentRenderer(buttonGroupComponentRenderer);

    if (process.env.VITE_USED_COMPONENTS_Chart !== "false") {
      this.registerComponentRenderer(chartRenderer);
      this.registerComponentRenderer(pieChartComponentRenderer);
      this.registerComponentRenderer(barChartComponentRenderer);
      this.registerComponentRenderer(mapComponentRenderer);
    }

    contributes.components?.forEach((renderer) => {
      this.registerComponentRenderer(renderer);
    });
    contributes.compoundComponents?.forEach((def) => {
      this.registerCompoundComponentRenderer({ compoundComponentDef: def });
    });

    this.registerActionFn(apiAction);
    this.registerActionFn(downloadAction);
    this.registerActionFn(uploadAction);
    this.registerActionFn(navigateAction);
    this.registerActionFn(timedAction);

    contributes.actions?.forEach((actionRenderer) => {
      this.registerActionFn(actionRenderer);
    });

    this.registerLoaderRenderer(apiLoaderRenderer);
    this.registerLoaderRenderer(externalDataLoaderRenderer);
    this.registerLoaderRenderer(mockLoaderRenderer);
    this.registerLoaderRenderer(dataLoaderRenderer);

    this.componentManager?.subscribeToRegistrations(this.registerComponentRenderer);
  }

  get componentThemeVars() {
    return this.themeVars;
  }

  get componentDefaultThemeVars() {
    return this.defaultThemeVars;
  }

  get actionFunctions(): Map<string, ActionFunction> {
    return this.actionFns;
  }

  public getRegisteredComponentKeys() {
    return Array.from(this.pool.keys());
  }

  public lookupComponentRenderer(viewComponentType: string): ComponentRegistryEntry | undefined {
    return this.pool.get(viewComponentType);
  }

  public lookupAction(actionType: string): ActionFunction | undefined {
    return this.actionFns.get(actionType);
  }

  /**
   * This method retrieves the registry entry of a loader registered with the specified key.
   * @param type The unique ID of the loader
   * @returns The loader registry entry, if found; otherwise, undefined.
   */
  public lookupLoaderRenderer(type: string): LoaderRenderer<any> | undefined {
    return this.loaders.get(type);
  }

  hasComponent(componentName: string) {
    return (
      this.pool.get(componentName) !== undefined ||
      this.loaders.get(componentName) !== undefined ||
      this.actionFns.get(componentName) !== undefined
    );
  }

  private registerComponentRenderer = ({
    type,
    renderer,
    metadata: hints,
  }: ComponentRendererDef) => {
    this.pool.set(type, { renderer, descriptor: hints });
    if (hints?.themeVars) {
      Object.keys(hints.themeVars).forEach((key) => this.themeVars.add(key));
    }
    if (hints?.defaultThemeVars) {
      merge(this.defaultThemeVars, hints?.defaultThemeVars);
    }
  };

  private registerCompoundComponentRenderer({
    compoundComponentDef,
    hints,
  }: CompoundComponentRendererInfo) {
    this.pool.set(compoundComponentDef.name, {
      renderer: (rendererContext: any) => {
        return (
          <CompoundComponent
            api={compoundComponentDef.api}
            scriptCollected={compoundComponentDef.scriptCollected}
            compound={compoundComponentDef.component as ComponentDef}
            {...rendererContext}
          />
        );
      },
      isCompoundComponent: true,
    });
    if (hints?.themeVars) {
      Object.keys(hints.themeVars).forEach((key) => this.themeVars.add(key));
    }
    if (hints?.defaultThemeVars) {
      merge(this.defaultThemeVars, hints?.defaultThemeVars);
    }
  }

  private registerActionFn({ actionName: functionName, actionFn }: ActionRendererDef) {
    this.actionFns.set(functionName, actionFn);
  }

  /**
   * This method registers a loader in the registry through its loader renderer definition.
   * @param type The loader's unique ID
   * @param renderer The renderer function that creates a React node according to the loader definition
   */
  private registerLoaderRenderer({ type, renderer }: LoaderRendererDef) {
    this.loaders.set(type, renderer);
  }

  /**
   * This method destroys the component registry; It unsubscribes from the component manager.
   * This method is called when the component registry is no longer needed, e.g., when the
   * component provider is unmounted (HMR).
   */
  destroy() {
    this.componentManager?.unSubscribeFromRegistrations(this.registerComponentRenderer);
  }
}

// --- Properties used by the ComponentProvider
type ComponentProviderProps = {
  // --- Child components to render
  children: ReactNode;

  // --- Definition of contributors
  contributes: ContributesDefinition;

  // --- The component manager instance used to manage components
  componentManager?: StandaloneComponentManager;
};

/**
 * This React component provides a context in which components can access the 
 * component registry. The component ensures that child components are not 
 * rendered before the component registry is initialized.
 */
export function ComponentProvider({
  children,
  contributes,
  componentManager,
}: ComponentProviderProps) {
  const [componentRegistry, setComponentRegistry] = useState(
    () => new ComponentRegistry(contributes, componentManager),
  );
  // --- Make sure the component registry is updated when the contributes or
  // --- component manager changes (e.g., due to HMR).
  useEffect(() => {
    setComponentRegistry((prev) => {
      prev.destroy();
      return new ComponentRegistry(contributes, componentManager);
    });
  }, [componentManager, contributes]);

  return (
    <ComponentRegistryContext.Provider value={componentRegistry}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}
