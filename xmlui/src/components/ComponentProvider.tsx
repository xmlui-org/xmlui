import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type {
  ComponentRendererDef,
  ComponentRendererFn,
  CompoundComponentRendererInfo,
} from "../abstractions/RendererDefs";
import {
  chStackComponentRenderer,
  cvStackComponentRenderer,
  hStackComponentRenderer,
  stackComponentRenderer,
  vStackComponentRenderer,
} from "./Stack/Stack";
import { spaceFillerComponentRenderer } from "./SpaceFiller/SpaceFiller";
import { textAreaComponentRenderer } from "./TextArea/TextArea";
import { navLinkComponentRenderer } from "./NavLink/NavLink";
import { localLinkComponentRenderer } from "./Link/Link";
import { treeComponentRenderer } from "./Tree/TreeComponent";
import { buttonComponentRenderer } from "./Button/Button";
import {
  h1ComponentRenderer,
  h2ComponentRenderer,
  h3ComponentRenderer,
  h4ComponentRenderer,
  h5ComponentRenderer,
  h6ComponentRenderer,
  headingComponentRenderer,
} from "./Heading/Heading";
import { textComponentRenderer } from "./Text/Text";
import { fragmentComponentRenderer } from "../components-core/Fragment";
import { tableComponentRenderer } from "./Table/Table";
import { stickyBoxComponentRenderer } from "./StickyBox/StickyBox";
import { badgeComponentRenderer } from "./Badge/Badge";
import { avatarComponentRenderer } from "./Avatar/Avatar";
import { contentSeparatorComponentRenderer } from "./ContentSeparator/ContentSeparator";
import { cardComponentRenderer } from "./Card/Card";
import { flowLayoutComponentRenderer } from "./FlowLayout/FlowLayout";
import { modalViewComponentRenderer } from "./ModalDialog/ModalDialog";
import { noResultComponentRenderer } from "./NoResult/NoResult";
import { fileUploadDropZoneComponentRenderer } from "./FileUploadDropZone/FileUploadDropZone";
import { iconComponentRenderer } from "./Icon/Icon";
import { itemsComponentRenderer } from "./Items/Items";
import { selectionStoreComponentRenderer } from "./SelectionStore/SelectionStore";
import { imageComponentRenderer } from "./Image/Image";
import { pageMetaTitleComponentRenderer } from "./PageMetaTitle/PageMetaTitle";
import { progressBarComponentRenderer } from "./ProgressBar/ProgressBar";
import {
  hSplitterComponentRenderer,
  splitterComponentRenderer,
  vSplitterComponentRenderer,
} from "./Splitter/Splitter";
import { queueComponentRenderer } from "./Queue/Queue";
import { CompoundComponent } from "../components-core/CompoundComponent";
import { dynamicHeightListComponentRenderer } from "./List/List";
import { positionedContainerComponentRenderer } from "./PositionedContainer/PositionedContainer";
import { changeListenerComponentRenderer } from "./ChangeListener/ChangeListener";
import { formItemComponentRenderer } from "./FormItem/FormItem";
import { passwordInputComponentRenderer, textBoxComponentRenderer } from "./TextBox/TextBox";
import { realTimeAdapterComponentRenderer } from "./RealTimeAdapter/RealTimeAdapter";
import { formComponentRenderer } from "./Form/Form";
import { emojiSelectorRenderer } from "./EmojiSelector/EmojiSelector";
import { numberBoxComponentRenderer } from "./NumberBox/NumberBox";
import { numberBox2ComponentRenderer } from "./NumberBox/NumberBox2";
import { hoverCardComponentRenderer } from "./HoverCard/HoverCard";
import { appRenderer } from "./App/App";
import { navPanelRenderer } from "./NavPanel/NavPanel";
import { pageRenderer, pagesRenderer } from "./Pages/Pages";
import type {
  ComponentDef,
  ComponentMetadata,
  CompoundComponentDef,
} from "../abstractions/ComponentDefs";
import { footerRenderer } from "./Footer/Footer";
import { navGroupComponentRenderer } from "./NavGroup/NavGroup";
import { logoComponentRenderer } from "./Logo/Logo";
import { radioGroupRenderer } from "./RadioGroup/RadioGroup";
import { SlotHolder } from "../components-core/Slot";
import { fileInputRenderer } from "./FileInput/FileInput";
import { spinnerComponentRenderer } from "./Spinner/Spinner";
import { markdownComponentRenderer } from "./Markdown/Markdown";
import { selectComponentRenderer } from "./Select/Select";
import { formSectionRenderer } from "./FormSection/FormSection";
import { checkboxComponentRenderer } from "./Checkbox/Checkbox";
import { switchComponentRenderer } from "./Switch/Switch";
import { appHeaderComponentRenderer } from "./AppHeader/AppHeader";
import {
  dropdownMenuComponentRenderer,
  menuItemRenderer,
  menuSeparatorRenderer,
  subMenuItemRenderer,
} from "./DropdownMenu/DropdownMenu";
import { themeComponentRenderer } from "./Theme/Theme";
import { merge } from "lodash-es";
import type { ComponentRegistryEntry } from "./ComponentRegistryContext";
import { ComponentRegistryContext } from "./ComponentRegistryContext";
import { columnComponentRenderer } from "./Column/Column";
import type { ActionFunction, ActionRendererDef } from "../abstractions/ActionDefs";
import { apiAction } from "../components-core/action/APICall";
import { downloadAction } from "../components-core/action/FileDownloadAction";
import { uploadAction } from "../components-core/action/FileUploadAction";
import { navigateAction } from "../components-core/action/NavigateAction";
import { timedAction } from "../components-core/action/TimedAction";
import type {
  LoaderRenderer,
  LoaderRendererDef,
} from "../components-core/abstractions/LoaderRenderer";
import { apiLoaderRenderer } from "../components-core/loader/ApiLoader";
import { externalDataLoaderRenderer } from "../components-core/loader/ExternalDataLoader";
import { mockLoaderRenderer } from "../components-core/loader/MockLoaderRenderer";
import { dataLoaderRenderer } from "../components-core/loader/DataLoader";
import { datePickerComponentRenderer } from "./DatePicker/DatePicker";
import { redirectRenderer } from "./Redirect/Redirect";
import { tabsComponentRenderer } from "./Tabs/Tabs";
import { bookmarkComponentRenderer } from "./Bookmark/Bookmark";
import { appStateComponentRenderer } from "./AppState/AppState";
import { tableOfContentsRenderer } from "./TableOfContents/TableOfContents";
import { accordionComponentRenderer } from "./Accordion/Accordion";
import { codeComponentRenderer } from "../components-core/XmluiCodeHighlighter";
import { tabItemComponentRenderer } from "./Tabs/TabItem";
import { accordionItemComponentRenderer } from "./Accordion/AccordionItem";
import { sliderComponentRenderer } from "./Slider/Slider";
import { carouselComponentRenderer } from "./Carousel/Carousel";
import { carouselItemComponentRenderer } from "./Carousel/CarouselItem";
import { createPropHolderComponent } from "../components-core/renderers";
import { breakoutComponentRenderer } from "./Breakout/Breakout";
import { toneChangerButtonComponentRenderer } from "./ToneChangerButton/ToneChangerButton";
import { apiCallRenderer } from "./APICall/APICall";
import { optionComponentRenderer } from "./Option/Option";
import { autoCompleteComponentRenderer } from "./AutoComplete/AutoComplete";
import type StandaloneExtensionManager from "../components-core/StandaloneExtensionManager";
import { backdropComponentRenderer } from "./Backdrop/Backdrop";
import type { ThemeDefinition } from "../abstractions/ThemingDefs";
import type { Extension } from "../abstractions/ExtensionDefs";
import {
  htmlAbbrTagRenderer,
  htmlAddressTagRenderer,
  htmlAreaTagRenderer,
  htmlArticleTagRenderer,
  htmlAsideTagRenderer,
  htmlATagRenderer,
  htmlAudioTagRenderer,
  htmlBdiTagRenderer,
  htmlBdoTagRenderer,
  htmlBlockquoteTagRenderer,
  htmlBrTagRenderer,
  htmlBTagRenderer,
  htmlButtonTagRenderer,
  htmlCanvasTagRenderer,
  htmlCaptionTagRenderer,
  htmlCiteTagRenderer,
  htmlCodeTagRenderer,
  htmlColgroupTagRenderer,
  htmlColTagRenderer,
  htmlDatalistTagRenderer,
  htmlDataTagRenderer,
  htmlDdTagRenderer,
  htmlDelTagRenderer,
  htmlDetailsTagRenderer,
  htmlDfnTagRenderer,
  htmlDialogTagRenderer,
  htmlDivTagRenderer,
  htmlDlTagRenderer,
  htmlDtTagRenderer,
  htmlEmbedTagRenderer,
  htmlEMTagRenderer,
  htmlFieldsetTagRenderer,
  htmlFigcaptionTagRenderer,
  htmlFigureTagRenderer,
  htmlFooterTagRenderer,
  htmlFormTagRenderer,
  htmlH1TagRenderer,
  htmlH2TagRenderer,
  htmlH3TagRenderer,
  htmlH4TagRenderer,
  htmlH5TagRenderer,
  htmlH6TagRenderer,
  htmlHeaderTagRenderer,
  htmlHrTagRenderer,
  htmlIframeTagRenderer,
  htmlImgTagRenderer,
  htmlInputTagRenderer,
  htmlInsTagRenderer,
  htmlITagRenderer,
  htmlKbdTagRenderer,
  htmlLabelTagRenderer,
  htmlLegendTagRenderer,
  htmlLiTagRenderer,
  htmlMainTagRenderer,
  htmlMapTagRenderer,
  htmlMarkTagRenderer,
  htmlMenuTagRenderer,
  htmlMeterTagRenderer,
  htmlNavTagRenderer,
  htmlObjectTagRenderer,
  htmlOlTagRenderer,
  htmlOptgroupTagRenderer,
  htmlOptionTagRenderer,
  htmlOutputTagRenderer,
  htmlParamTagRenderer,
  htmlPictureTagRenderer,
  htmlPreTagRenderer,
  htmlProgressTagRenderer,
  htmlPTagRenderer,
  htmlQTagRenderer,
  htmlRpTagRenderer,
  htmlRtTagRenderer,
  htmlRubyTagRenderer,
  htmlSampTagRenderer,
  htmlSectionTagRenderer,
  htmlSelectTagRenderer,
  htmlSmallTagRenderer,
  htmlSourceTagRenderer,
  htmlSpanTagRenderer,
  htmlSTagRenderer,
  htmlStrongTagRenderer,
  htmlSubTagRenderer,
  htmlSummaryTagRenderer,
  htmlSupTagRenderer,
  htmlTableTagRenderer,
  htmlTbodyTagRenderer,
  htmlTdTagRenderer,
  htmlTemplateTagRenderer,
  htmlTextareaTagRenderer,
  htmlTfootTagRenderer,
  htmlTheadTagRenderer,
  htmlThTagRenderer,
  htmlTimeTagRenderer,
  htmlTrackTagRenderer,
  htmlTrTagRenderer,
  htmlUlTagRenderer,
  htmlUTagRenderer,
  htmlVarTagRenderer,
  htmlVideoTagRenderer,
  htmlWbrTagRenderer,
} from "./HtmlTags/HtmlTags";
import { colorPickerComponentRenderer } from "./ColorPicker/ColorPicker";
import { radioItemComponentRenderer } from "./RadioGroup/RadioItem";
import { inspectButtonComponentRenderer } from "./InspectButton/InspectButton";
import { nestedAppComponentRenderer } from "./NestedApp/NestedApp";
import { codeBlockComponentRenderer } from "./CodeBlock/CodeBlock";

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
 * Applications can contribute to the registry with their custom (third-party)
 * and application-specific components and others. This type holds the
 * definitions of these extra artifacts.
 */
export type ContributesDefinition = {
  /**
   * Native xmlui components that come with the app.
   */
  components?: ComponentRendererDef[];

  /**
   * Application-specific compound components that come with the app.
   */
  compoundComponents?: CompoundComponentDef[];

  /**
   * Themes that come with the app.
   */
  themes?: ThemeDefinition[];
};

/**
 * This class implements the registry that holds the components available
 * in xmlui. Any component in this registry can be used in the xmlui markup.
 * An error is raised when the markup processor does not find a particular
 * component within the registry.
 */
export class ComponentRegistry {
  // --- The pool of available components
  private pool = new Map<string, ComponentRegistryEntry>();

  // --- The pool of available theme variable names
  private themeVars = new Set<string>();

  // --- Default theme variable values collected from the registered components
  private defaultThemeVars = {};

  // --- The pool of available action functions
  private actionFns = new Map<string, ActionFunction>();

  // --- The pool of available loader renderers
  private loaders = new Map<string, LoaderRenderer<any>>();

  /**
   * The component constructor registers all xmlui core components, so each
   * registry instance incorporates the framework's core. It also receives a
   * `contributes` argument with information about accompanying (app-specific)
   * components that come with a particular app using the registry.
   * @param contributes Information about the components that come with the app
   * @param extensionManager Optional manager object that receives a notification
   * about component registrations
   */
  constructor(
    contributes: ContributesDefinition = {},
    private readonly extensionManager?: StandaloneExtensionManager,
  ) {
    this.extensionManager = extensionManager;

    // we register these first, so that core components with the same name can override them (without namespace)
    contributes.components?.forEach((renderer) => {
      this.registerAppComponent(renderer);
    });
    contributes.compoundComponents?.forEach((def) => {
      this.registerAppComponent({ compoundComponentDef: def });
    });

    if (process.env.VITE_USED_COMPONENTS_Stack !== "false") {
      this.registerCoreComponent(stackComponentRenderer);
      this.registerCoreComponent(vStackComponentRenderer);
      this.registerCoreComponent(hStackComponentRenderer);
      this.registerCoreComponent(cvStackComponentRenderer);
      this.registerCoreComponent(chStackComponentRenderer);
    }

    this.registerCoreComponent(SlotHolder);
    this.registerCoreComponent(dataSourcePropHolder);
    this.registerCoreComponent(textNodePropHolder);
    this.registerCoreComponent(textNodeCDataPropHolder);
    if (process.env.VITE_USED_COMPONENTS_SpaceFiller !== "false") {
      this.registerCoreComponent(spaceFillerComponentRenderer);
    }

    if (process.env.VITE_USED_COMPONENTS_Textarea !== "false") {
      this.registerCoreComponent(textAreaComponentRenderer);
    }

    if (process.env.VITE_USED_COMPONENTS_AppHeader !== "false") {
      this.registerCoreComponent(appHeaderComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Footer !== "false") {
      this.registerCoreComponent(footerRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Logo !== "false") {
      this.registerCoreComponent(logoComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NavLink !== "false") {
      this.registerCoreComponent(navLinkComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NavGroup !== "false") {
      this.registerCoreComponent(navGroupComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Link !== "false") {
      this.registerCoreComponent(localLinkComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Form !== "false") {
      this.registerCoreComponent(formComponentRenderer);
      this.registerCoreComponent(formItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Tree !== "false") {
      this.registerCoreComponent(treeComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Button !== "false") {
      this.registerCoreComponent(buttonComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Checkbox !== "false") {
      this.registerCoreComponent(checkboxComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Switch !== "false") {
      this.registerCoreComponent(switchComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Heading !== "false") {
      this.registerCoreComponent(headingComponentRenderer);
      this.registerCoreComponent(h1ComponentRenderer);
      this.registerCoreComponent(h2ComponentRenderer);
      this.registerCoreComponent(h3ComponentRenderer);
      this.registerCoreComponent(h4ComponentRenderer);
      this.registerCoreComponent(h5ComponentRenderer);
      this.registerCoreComponent(h6ComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Text !== "false") {
      this.registerCoreComponent(textComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Fragment !== "false") {
      this.registerCoreComponent(fragmentComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Table !== "false") {
      this.registerCoreComponent(tableComponentRenderer);
      this.registerCoreComponent(columnComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_List !== "false") {
      this.registerCoreComponent(dynamicHeightListComponentRenderer);
    }

    if (process.env.VITE_USED_COMPONENTS_App !== "false") {
      this.registerCoreComponent(appRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NavPanel !== "false") {
      this.registerCoreComponent(navPanelRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Pages !== "false") {
      this.registerCoreComponent(pagesRenderer);
      this.registerCoreComponent(pageRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Redirect !== "false") {
      this.registerCoreComponent(redirectRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_StickyBox !== "false") {
      this.registerCoreComponent(stickyBoxComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Badge !== "false") {
      this.registerCoreComponent(badgeComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Avatar !== "false") {
      this.registerCoreComponent(avatarComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_ContentSeparator !== "false") {
      this.registerCoreComponent(contentSeparatorComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Card !== "false") {
      this.registerCoreComponent(cardComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_ColorPicker !== "false") {
      this.registerCoreComponent(colorPickerComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_FlowLayout !== "false") {
      this.registerCoreComponent(flowLayoutComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_ModalDialog !== "false") {
      this.registerCoreComponent(modalViewComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_NoResult !== "false") {
      this.registerCoreComponent(noResultComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Option !== "false") {
      this.registerCoreComponent(optionComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_TabItem !== "false") {
      this.registerCoreComponent(tabItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_AccordionItem !== "false") {
      this.registerCoreComponent(accordionItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_CarouselItem !== "false") {
      this.registerCoreComponent(carouselItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_RadioItem !== "false") {
      this.registerCoreComponent(radioItemComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_FileUploadDropZone !== "false") {
      this.registerCoreComponent(fileUploadDropZoneComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Icon !== "false") {
      this.registerCoreComponent(iconComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Items !== "false") {
      this.registerCoreComponent(itemsComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_SelectionStore !== "false") {
      this.registerCoreComponent(selectionStoreComponentRenderer);
    }
    if (process.env.VITE_USED_COMPONENTS_Image !== "false") {
      this.registerCoreComponent(imageComponentRenderer);
    }

    if (process.env.VITE_USER_COMPONENTS_XmluiCodeHightlighter !== "false") {
      this.registerCoreComponent(codeComponentRenderer);
    }

    if (process.env.VITE_USER_COMPONENTS_Markdown !== "false") {
      this.registerCoreComponent(markdownComponentRenderer);
    }

    if (process.env.VITE_INCLUDE_REST_COMPONENTS !== "false") {
      //TODO, if it proves to be a working solution, make these components skippable, too
      this.registerCoreComponent(pageMetaTitleComponentRenderer);
      this.registerCoreComponent(progressBarComponentRenderer);
      this.registerCoreComponent(splitterComponentRenderer);
      this.registerCoreComponent(vSplitterComponentRenderer);
      this.registerCoreComponent(hSplitterComponentRenderer);
      this.registerCoreComponent(queueComponentRenderer);
      this.registerCoreComponent(positionedContainerComponentRenderer);
      this.registerCoreComponent(changeListenerComponentRenderer);
      this.registerCoreComponent(realTimeAdapterComponentRenderer);
      this.registerCoreComponent(textBoxComponentRenderer);
      this.registerCoreComponent(passwordInputComponentRenderer);
      this.registerCoreComponent(emojiSelectorRenderer);
      this.registerCoreComponent(numberBoxComponentRenderer);
      this.registerCoreComponent(numberBox2ComponentRenderer);
      this.registerCoreComponent(hoverCardComponentRenderer);
      this.registerCoreComponent(radioGroupRenderer);
      this.registerCoreComponent(fileInputRenderer);
      this.registerCoreComponent(datePickerComponentRenderer);
      this.registerCoreComponent(spinnerComponentRenderer);
      this.registerCoreComponent(selectComponentRenderer);
      this.registerCoreComponent(autoCompleteComponentRenderer);
      this.registerCoreComponent(dropdownMenuComponentRenderer);
      this.registerCoreComponent(toneChangerButtonComponentRenderer);
      this.registerCoreComponent(inspectButtonComponentRenderer);
      this.registerCoreComponent(formSectionRenderer);
      this.registerCoreComponent(dropdownMenuComponentRenderer);
      this.registerCoreComponent(menuItemRenderer);
      this.registerCoreComponent(subMenuItemRenderer);
      this.registerCoreComponent(menuSeparatorRenderer);
      this.registerCoreComponent(tabsComponentRenderer);
      this.registerCoreComponent(bookmarkComponentRenderer);
      this.registerCoreComponent(tableOfContentsRenderer);
      this.registerCoreComponent(breakoutComponentRenderer);
      this.registerCoreComponent(codeBlockComponentRenderer);
    }
    this.registerCoreComponent(themeComponentRenderer);
    this.registerCoreComponent(appStateComponentRenderer);
    this.registerCoreComponent(apiCallRenderer);

    // --- New Bootstrap-inspired components
    this.registerCoreComponent(carouselComponentRenderer);
    this.registerCoreComponent(accordionComponentRenderer);
    this.registerCoreComponent(sliderComponentRenderer);
    this.registerCoreComponent(backdropComponentRenderer);

    this.registerCoreComponent(htmlATagRenderer);
    this.registerCoreComponent(htmlAbbrTagRenderer);
    this.registerCoreComponent(htmlAddressTagRenderer);
    this.registerCoreComponent(htmlAreaTagRenderer);
    this.registerCoreComponent(htmlArticleTagRenderer);
    this.registerCoreComponent(htmlAsideTagRenderer);
    this.registerCoreComponent(htmlAudioTagRenderer);
    this.registerCoreComponent(htmlBTagRenderer);
    this.registerCoreComponent(htmlBdiTagRenderer);
    this.registerCoreComponent(htmlBdoTagRenderer);
    this.registerCoreComponent(htmlBlockquoteTagRenderer);
    this.registerCoreComponent(htmlBrTagRenderer);
    this.registerCoreComponent(htmlButtonTagRenderer);
    this.registerCoreComponent(htmlCanvasTagRenderer);
    this.registerCoreComponent(htmlCaptionTagRenderer);
    this.registerCoreComponent(htmlCiteTagRenderer);
    this.registerCoreComponent(htmlCodeTagRenderer);
    this.registerCoreComponent(htmlColTagRenderer);
    this.registerCoreComponent(htmlColgroupTagRenderer);
    this.registerCoreComponent(htmlDataTagRenderer);
    this.registerCoreComponent(htmlDatalistTagRenderer);
    this.registerCoreComponent(htmlDdTagRenderer);
    this.registerCoreComponent(htmlDelTagRenderer);
    this.registerCoreComponent(htmlDetailsTagRenderer);
    this.registerCoreComponent(htmlDfnTagRenderer);
    this.registerCoreComponent(htmlDialogTagRenderer);
    this.registerCoreComponent(htmlDivTagRenderer);
    this.registerCoreComponent(htmlDlTagRenderer);
    this.registerCoreComponent(htmlDtTagRenderer);
    this.registerCoreComponent(htmlEMTagRenderer);
    this.registerCoreComponent(htmlEmbedTagRenderer);
    this.registerCoreComponent(htmlFieldsetTagRenderer);
    this.registerCoreComponent(htmlFigcaptionTagRenderer);
    this.registerCoreComponent(htmlFigureTagRenderer);
    this.registerCoreComponent(htmlFooterTagRenderer);
    this.registerCoreComponent(htmlFormTagRenderer);
    this.registerCoreComponent(htmlH1TagRenderer);
    this.registerCoreComponent(htmlH2TagRenderer);
    this.registerCoreComponent(htmlH3TagRenderer);
    this.registerCoreComponent(htmlH4TagRenderer);
    this.registerCoreComponent(htmlH5TagRenderer);
    this.registerCoreComponent(htmlH6TagRenderer);
    this.registerCoreComponent(htmlHeaderTagRenderer);
    this.registerCoreComponent(htmlHrTagRenderer);
    this.registerCoreComponent(htmlITagRenderer);
    this.registerCoreComponent(htmlIframeTagRenderer);
    this.registerCoreComponent(htmlImgTagRenderer);
    this.registerCoreComponent(htmlInputTagRenderer);
    this.registerCoreComponent(htmlInsTagRenderer);
    this.registerCoreComponent(htmlKbdTagRenderer);
    this.registerCoreComponent(htmlLabelTagRenderer);
    this.registerCoreComponent(htmlLegendTagRenderer);
    this.registerCoreComponent(htmlLiTagRenderer);
    this.registerCoreComponent(htmlMainTagRenderer);
    this.registerCoreComponent(htmlMapTagRenderer);
    this.registerCoreComponent(htmlMarkTagRenderer);
    this.registerCoreComponent(htmlMenuTagRenderer);
    this.registerCoreComponent(htmlMeterTagRenderer);
    this.registerCoreComponent(htmlNavTagRenderer);
    this.registerCoreComponent(htmlObjectTagRenderer);
    this.registerCoreComponent(htmlOlTagRenderer);
    this.registerCoreComponent(htmlOptgroupTagRenderer);
    this.registerCoreComponent(htmlOptionTagRenderer);
    this.registerCoreComponent(htmlOutputTagRenderer);
    this.registerCoreComponent(htmlPTagRenderer);
    this.registerCoreComponent(htmlParamTagRenderer);
    this.registerCoreComponent(htmlPictureTagRenderer);
    this.registerCoreComponent(htmlPreTagRenderer);
    this.registerCoreComponent(htmlProgressTagRenderer);
    this.registerCoreComponent(htmlQTagRenderer);
    this.registerCoreComponent(htmlRpTagRenderer);
    this.registerCoreComponent(htmlRtTagRenderer);
    this.registerCoreComponent(htmlRubyTagRenderer);
    this.registerCoreComponent(htmlSTagRenderer);
    this.registerCoreComponent(htmlSampTagRenderer);
    this.registerCoreComponent(htmlSectionTagRenderer);
    this.registerCoreComponent(htmlSelectTagRenderer);
    this.registerCoreComponent(htmlSmallTagRenderer);
    this.registerCoreComponent(htmlSourceTagRenderer);
    this.registerCoreComponent(htmlSpanTagRenderer);
    this.registerCoreComponent(htmlStrongTagRenderer);
    this.registerCoreComponent(htmlSubTagRenderer);
    this.registerCoreComponent(htmlSummaryTagRenderer);
    this.registerCoreComponent(htmlSupTagRenderer);
    this.registerCoreComponent(htmlTableTagRenderer);
    this.registerCoreComponent(htmlTbodyTagRenderer);
    this.registerCoreComponent(htmlTdTagRenderer);
    this.registerCoreComponent(htmlTemplateTagRenderer);
    this.registerCoreComponent(htmlTextareaTagRenderer);
    this.registerCoreComponent(htmlTfootTagRenderer);
    this.registerCoreComponent(htmlThTagRenderer);
    this.registerCoreComponent(htmlTheadTagRenderer);
    this.registerCoreComponent(htmlTimeTagRenderer);
    this.registerCoreComponent(htmlTrTagRenderer);
    this.registerCoreComponent(htmlTrackTagRenderer);
    this.registerCoreComponent(htmlUTagRenderer);
    this.registerCoreComponent(htmlUlTagRenderer);
    this.registerCoreComponent(htmlVarTagRenderer);
    this.registerCoreComponent(htmlVideoTagRenderer);
    this.registerCoreComponent(htmlWbrTagRenderer);

    // --- Nested app and related components
    this.registerCoreComponent(nestedAppComponentRenderer);

    this.registerActionFn(apiAction);
    this.registerActionFn(downloadAction);
    this.registerActionFn(uploadAction);
    this.registerActionFn(navigateAction);
    this.registerActionFn(timedAction);

    this.registerLoaderRenderer(apiLoaderRenderer);
    this.registerLoaderRenderer(externalDataLoaderRenderer);
    this.registerLoaderRenderer(mockLoaderRenderer);
    this.registerLoaderRenderer(dataLoaderRenderer);

    this.extensionManager?.subscribeToRegistrations(this.extensionRegistered);
  }

  /**
   * All theme variables used by the registered components.
   */
  get componentThemeVars() {
    return this.themeVars;
  }

  /**
   * The default values of theme variables used by the registered components.
   */
  get componentDefaultThemeVars() {
    return this.defaultThemeVars;
  }

  /**
   * All action functions registered in the component registry.
   */
  get actionFunctions(): Map<string, ActionFunction> {
    return this.actionFns;
  }

  /**
   * @returns The keys of all components registered in the component registry.
   */
  getRegisteredComponentKeys() {
    return Array.from(this.pool.keys());
  }

  /**
   * This method retrieves the registry entry of a component registered
   * with the specified key.
   * @param componentName The unique ID of the component
   * @returns The component registry entry, if found; otherwise, undefined.
   */
  lookupComponentRenderer(componentName: string): ComponentRegistryEntry | undefined {
    return this.pool.get(componentName);
  }

  /**
   * This method retrieves the registry entry of an action registered
   * with the specified key.
   * @param actionType The unique ID of the action
   * @returns The action registry entry, if found; otherwise, undefined.
   */
  lookupAction(actionType: string): ActionFunction | undefined {
    return this.actionFns.get(actionType);
  }

  /**
   * This method retrieves the registry entry of a loader registered with the
   * specified key.
   * @param type The unique ID of the loader
   * @returns The loader registry entry, if found; otherwise, undefined.
   */
  lookupLoaderRenderer(type: string): LoaderRenderer<any> | undefined {
    return this.loaders.get(type);
  }

  /**
   * This method checks whether a component with the specified key is
   * registered in the component registry.
   * @param componentName The unique ID of the component
   * @returns True if the component is registered; otherwise, false.
   */
  hasComponent(componentName: string) {
    return (
      this.pool.get(componentName) !== undefined ||
      this.loaders.get(componentName) !== undefined ||
      this.actionFns.get(componentName) !== undefined
    );
  }

  // --- Registers a loader renderer using its definition
  registerLoaderRenderer({ type, renderer }: LoaderRendererDef) {
    this.loaders.set(type, renderer);
  }

  /**
   * This method destroys the component registry; It unsubscribes from the component manager.
   * This method is called when the component registry is no longer needed, e.g., when the
   * component provider is unmounted (HMR).
   */
  destroy() {
    this.extensionManager?.unSubscribeFromRegistrations(this.extensionRegistered);
  }

  private extensionRegistered = (extension: Extension) => {
    extension.components?.forEach((c) => {
      if ("type" in c) {
        //we handle just the js components for now
        this.registerComponentRenderer(c, extension.namespace);
      }
    });
  };

  // --- Registers a renderable component using its renderer function

  private registerCoreComponent = (
    component: ComponentRendererDef | CompoundComponentRendererInfo,
  ) => {
    const coreNamespaces = ["#xmlui-core-ns", ""];
    if ("compoundComponentDef" in component) {
      this.registerCompoundComponentRenderer(component, ...coreNamespaces);
    } else {
      this.registerComponentRenderer(component, ...coreNamespaces);
    }
  };

  private registerAppComponent = (
    component: ComponentRendererDef | CompoundComponentRendererInfo,
  ) => {
    const appNamespaces = ["#app-ns", ""];
    if ("compoundComponentDef" in component) {
      this.registerCompoundComponentRenderer(component, ...appNamespaces);
    } else {
      this.registerComponentRenderer(component, ...appNamespaces);
    }
  };

  // --- and metadata
  private registerComponentRenderer = (
    {
      type,
      renderer,
      metadata,
      isCompoundComponent,
    }: {
      type: string;
      renderer: ComponentRendererFn<any>;
      isCompoundComponent?: boolean;
      metadata?: ComponentMetadata;
    },
    ...namespaces: string[]
  ) => {
    const component: ComponentRegistryEntry = {
      renderer,
      descriptor: metadata,
      isCompoundComponent,
    };
    namespaces.forEach((ns) => {
      this.pool.set((ns ? ns + "." : "") + type, component);
    });
    if (metadata?.themeVars) {
      Object.keys(metadata.themeVars).forEach((key) => this.themeVars.add(key));
    }
    if (metadata?.defaultThemeVars) {
      merge(this.defaultThemeVars, metadata?.defaultThemeVars);
    }
  };

  // --- Registers a compound component using its definition and metadata
  private registerCompoundComponentRenderer(
    { compoundComponentDef, metadata }: CompoundComponentRendererInfo,
    ...namespaces: string[]
  ) {
    const component = {
      type: compoundComponentDef.name,
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
      metadata,
    };

    this.registerComponentRenderer(component, ...namespaces);
  }

  // --- Registers an action function using its definition
  private registerActionFn({ actionName: functionName, actionFn }: ActionRendererDef) {
    this.actionFns.set(functionName, actionFn);
  }
}

// --- Properties used by the ComponentProvider
type ComponentProviderProps = {
  // --- Child components to render
  children: ReactNode;

  // --- Definition of contributors
  contributes: ContributesDefinition;

  // --- The component manager instance used to manage components
  extensionManager?: StandaloneExtensionManager;
};

/**
 * This React component provides a context in which components can access the
 * component registry. The component ensures that child components are not
 * rendered before the component registry is initialized.
 */
export function ComponentProvider({
  children,
  contributes,
  extensionManager,
}: ComponentProviderProps) {
  const [componentRegistry, setComponentRegistry] = useState(
    () => new ComponentRegistry(contributes, extensionManager),
  );
  // --- Make sure the component registry is updated when the contributes or
  // --- component manager changes (e.g., due to HMR).
  useEffect(() => {
    setComponentRegistry((prev) => {
      prev.destroy();
      return new ComponentRegistry(contributes, extensionManager);
    });
  }, [extensionManager, contributes]);

  return (
    <ComponentRegistryContext.Provider value={componentRegistry}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}
