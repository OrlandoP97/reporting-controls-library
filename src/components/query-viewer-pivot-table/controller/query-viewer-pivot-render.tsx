import { Component, h, Prop, Host, Element, Method } from "@stencil/core";

import { QueryViewerServiceResponsePivotTable } from "@genexus/reporting-api/dist/types/service-result";
import {
  QueryViewerAxisOrderType,
  QueryViewerOutputType,
  QueryViewerPivotCollection,
  QueryViewerPivotParameters,
  QueryViewerShowDataLabelsIn,
  QueryViewerTableParameters,
  QueryViewerTotal,
  QueryViewerTranslations
} from "../../../common/basic-types";
import { OAT } from "jspivottable";
let autoId = 0;
@Component({
  tag: "gx-query-viewer-pivot-render",
  styleUrl: "query-viewer-pivot-render.scss"
})
export class QueryViewerPivotTableRender {
  private controllerId: string;
  private ucId: string;
  private pivotRef: HTMLGxQueryViewerPivotElement;
  private mustWaitInitialPageDataForTable = false;

  @Element() element: HTMLGxQueryViewerPivotRenderElement;

  /**
   * Response Attribute Values
   */
  @Prop() readonly attributeValuesForPivotTableXml: string;

  /**
   * Response Attribute Values for Table
   */
  @Prop() readonly attributeValuesForTableXml: string;

  /**
   * Allowing elements order to change
   */
  @Prop() readonly allowElementsOrderChange: boolean;

  /**
   * Allow selection
   */
  @Prop() readonly allowSelection: boolean;

  /**
   * Response Attribute Values
   */
  @Prop() readonly calculatePivottableDataXml: string;

  /**
   * Response Pivot Table Data Sync
   */
  @Prop() readonly pivotTableDataSyncXml: string;

  /**
   * A CSS class to set as the `gx-query-viewer-pivot-controller` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   * Allowing or not Column sort
   */
  @Prop() readonly disableColumnSort: boolean;

  /**
   * This attribute lets you define a title for the pivot table.
   */
  @Prop() readonly pivotTitle: string;

  /**
   * Response Page Data
   */
  @Prop() readonly pageDataForPivotTable: string;

  /**
   * This attribute lets you determinate whether there will be paging buttons.
   */
  @Prop() readonly paging: boolean;

  /**
   * Enables you to define the number of rows that will be shown when the Paging property is activated
   */
  @Prop() readonly pageSize: number;

  /**
   * For timeline for remembering layout
   */
  @Prop() readonly rememberLayout: boolean;

  /**
   * It allows to indicate how you want to display the Data elements of the Query object.
   */
  @Prop() readonly showDataLabelsIn: QueryViewerShowDataLabelsIn;

  /**
   * Specifies the metadata and data that the control will use to render.
   */
  @Prop() readonly serviceResponse: QueryViewerServiceResponsePivotTable;

  /**
   * Specifies whether the render output is PivotTable or Table
   */
  @Prop() readonly tableType:
    | QueryViewerOutputType.PivotTable
    | QueryViewerOutputType.Table;

  /**
   * Determines whether to show a total of all values in the pivot table rows.
   */
  @Prop() readonly totalForRows: QueryViewerTotal;

  /**
   * Determines whether to show a total of all values in the pivot table columns.
   */
  @Prop() readonly totalForColumns: QueryViewerTotal;

  /**
   * For translate the labels of the outputs
   */
  @Prop() readonly translations: QueryViewerTranslations;

  /**
   * Response Page Data
   */
  @Prop() readonly pageDataForTable: string;

  /**
   * Response Table Data Sync
   */
  @Prop() readonly tableDataSyncXml: string;

  /**
   * Returns an XML on a string variable containing all the data for the attributes loaded in the Pivot Table.
   */
  @Method()
  async getDataPivot(serverData: string) {
    return this.pivotRef.getDataXML(serverData);
  }

  /**
   * Returns an XML on a string variable containing the data which is being visualized at the moment (the difference with the GetData() method it's seen on the Pivot Table, data can be different because of filters application).
   */
  @Method()
  async getFilteredDataPivot(serverData: string) {
    return this.pivotRef.getFilteredDataPivot(serverData);
  }

  /**
   * Method to navigate to the next page.
   */
  @Method()
  async nextPage() {
    return this.pivotRef.nextPage();
  }

  /**
   * Method to navigate to the first page.
   */
  @Method()
  async firstPage() {
    return this.pivotRef.firstPage();
  }

  /**
   * Method to navigate to the previous page.
   */
  @Method()
  async previousPage() {
    return this.pivotRef.previousPage();
  }

  /**
   * Method to navigate to the last page.
   */
  @Method()
  async lastPage() {
    return this.pivotRef.lastPage();
  }

  private getPivotTableParameters():
    | QueryViewerPivotParameters
    | QueryViewerTableParameters {
    if (!this.serviceResponse) {
      return undefined;
    }

    if (this.pageDataForTable && this.mustWaitInitialPageDataForTable) {
      this.mustWaitInitialPageDataForTable = false;
    } else if (this.tableType === QueryViewerOutputType.Table) {
      this.checkDataPaging();
      return undefined;
    }

    if (this.tableType === QueryViewerOutputType.PivotTable) {
      const pivotParameters: QueryViewerPivotParameters = {
        RealType: QueryViewerOutputType.PivotTable,
        ObjectName: this.serviceResponse.objectName,
        ControlName: this.controllerId,
        PageSize: this.paging === true ? this.pageSize : undefined,
        metadata: this.serviceResponse.metadataXML,
        UcId: this.ucId,
        // ToDo: check if this property make sense with the AutoGrow implementation in the SD programming model
        AutoResize: true,
        DisableColumnSort: this.disableColumnSort,
        RememberLayout: this.rememberLayout,
        ShowDataLabelsIn: this.showDataLabelsIn,
        UseRecordsetCache: !this.serviceResponse.useGxQuery,
        AllowSelection: this.allowSelection,
        SelectLine: true,
        // ToDo: update this value
        ServerPaging: true,
        // ToDo: update this value
        ServerPagingPivot: this.paging,
        // ToDo: update this value
        ServerPagingCacheSize: 0,
        TotalForColumns: this.totalForColumns,
        TotalForRows: this.totalForRows,
        Title: this.pivotTitle
      };
      return pivotParameters;
    }
    const tableParameters: QueryViewerTableParameters = {
      RealType: QueryViewerOutputType.Table,
      ObjectName: this.serviceResponse.objectName,
      ControlName: this.controllerId,
      PageSize: this.paging === true ? this.pageSize : undefined,
      metadata: this.serviceResponse.metadataXML,
      UcId: this.ucId,
      // ToDo: check if this property make sense with the AutoGrow implementation in the SD programming model
      AutoResize: true,
      DisableColumnSort: this.disableColumnSort,
      RememberLayout: this.rememberLayout,
      ShowDataLabelsIn: this.showDataLabelsIn,
      UseRecordsetCache: !this.serviceResponse.useGxQuery,
      AllowSelection: this.allowSelection,
      SelectLine: true,
      // ToDo: update this value
      ServerPaging: true,
      // ToDo: update this value
      ServerPagingPivot: this.paging,
      // ToDo: update this value
      ServerPagingCacheSize: 0,
      TotalForColumns: this.totalForColumns,
      TotalForRows: this.totalForRows,
      Title: this.pivotTitle,
      data: this.pageDataForTable
    };
    return tableParameters;
    // ToDo: check if gx-query need this field
    // let data;
    // if (gx.lang.gxBoolean(qViewer.IsExternalQuery)) {
    //   data = qViewer.xml.data;
    // } else if (qViewer.RealType == QueryViewerOutputType.Table) {
    //   data = qViewer.ServerPagingForTable
    //     ? qViewer.xml.pageData
    //     : qViewer.xml.data;
    // } else {
    //   data = qViewer.ServerPagingForPivotTable
    //     ? qViewer.xml.pageData
    //     : qViewer.xml.data;
    // }
    // qViewer.pivotParams.data = data;

    // qViewer.pivotParams.ServerPaging =
    //   qViewer.ServerPagingForTable &&
    //   !gx.lang.gxBoolean(qViewer.IsExternalQuery);
    // qViewer.pivotParams.ServerPagingPivot =
    //   qViewer.ServerPagingForPivotTable &&
    //   !gx.lang.gxBoolean(qViewer.IsExternalQuery);
    //  qViewer.pivotParams.ServerPagingCacheSize = 0;
  }

  private checkDataPaging() {
    if (this.paging && this.tableType === QueryViewerOutputType.Table) {
      // Tabla con paginado en el server
      const previousStateSave = OAT.getStateWhenServingPaging
        ? OAT.getStateWhenServingPaging(
            this.ucId + "_" + this.serviceResponse.objectName,
            this.serviceResponse.objectName
          )
        : false;

      if (!previousStateSave || !this.rememberLayout) {
        this.mustWaitInitialPageDataForTable = true;
        this.requestInitialPageDataForTable();
      }
    } else if (!this.paging) {
      // Paginado en el cliente
      // qv.services.GetDataIfNeeded(qViewer, function (resText, qViewer) {
      //   // Servicio GetData
      //   if (resText != qViewer.xml.data) {
      //     qViewer.xml.data = resText;
      //   }
      //   const d3 = new Date();
      //   const t3 = d3.getTime();
      //   if (!qv.util.anyError(resText)) {
      //     renderPivotTable(qViewer);
      //   } else {
      //     // Error en el servicio GetData
      //     errMsg = qv.util.getErrorFromText(resText);
      //     qv.util.renderError(qViewer, errMsg);
      //   }
      // });
    }
  }

  private getPivotTableCollection(): QueryViewerPivotCollection {
    const qv: QueryViewerPivotCollection = {
      collection: {},
      fadeTimeouts: {}
    };

    qv.collection[this.ucId] = {
      AutoRefreshGroup: "",
      debugServices: false,
      ControlName: "Queryviewer1",
      Metadata: {
        Axes: this.serviceResponse.MetaData.axes,
        Data: this.serviceResponse.MetaData.data
      }
    };
    return qv;
  }

  // private UpdateQueryViewer(qViewer, sourceElements, allowElementsOrderChange) {
  //   // ToDo: check if this function is neccesary
  //   // UpdateTargetElementsAndParametersFromSourceElements(
  //   //   qViewer,
  //   //   sourceElements
  //   // );
  //   // ToDo: check this
  //   // qv.util.autorefresh.SaveAxesAndParametersState(qViewer);
  //   // qViewer._Autorefreshing = true;
  //   qViewer.realShow();
  // }

  private getDataFieldAndOrder() {
    for (let i = 0; i < this.serviceResponse.MetaData.axes.length; i++) {
      const axis = this.serviceResponse.MetaData.axes[i];
      if (
        axis.order.type === QueryViewerAxisOrderType.Ascending ||
        axis.order.type === QueryViewerAxisOrderType.Descending
      ) {
        return { dataFieldOrder: axis.dataField, orderType: axis.order.type };
      }
    }
    return { dataFieldOrder: "", orderType: "" };
  }

  private requestInitialPageDataForTable() {
    const dataFieldAndOrder = this.getDataFieldAndOrder();

    const pageDataTableParameters = {
      PageNumber: 1,
      PageSize: this.pageSize,
      RecalculateCantPages: true,
      DataFieldOrder: dataFieldAndOrder.dataFieldOrder,
      OrderType: dataFieldAndOrder.orderType,
      Filters: [],
      LayoutChange: false,
      // ToDo: get the proper QueryViewerId
      QueryviewerId: ""
    };
    const requestPageDataEvent = new CustomEvent("RequestPageDataForTable", {
      bubbles: true
    });
    (requestPageDataEvent as any).parameter = pageDataTableParameters;
    this.element.dispatchEvent(requestPageDataEvent);
  }

  componentWillLoad() {
    this.ucId = `gx_query_viewer_user_controller_${autoId}`;
    this.controllerId = `gx-query-viewer-pivot-controller-${autoId}`;
    autoId++;
  }

  render() {
    if (this.serviceResponse == null) {
      return "";
    }
    const pivotParameters = this.getPivotTableParameters();
    const pivotCollection = this.getPivotTableCollection();

    if (this.mustWaitInitialPageDataForTable) {
      return "";
    }

    if (this.tableType === QueryViewerOutputType.PivotTable) {
      return (
        <Host>
          <gx-query-viewer-pivot
            pivotCollection={pivotCollection}
            pivotParameters={pivotParameters}
            pageDataForPivotTable={this.pageDataForPivotTable}
            attributeValuesForPivotTableXml={
              this.attributeValuesForPivotTableXml
            }
            calculatePivottableDataXml={this.calculatePivottableDataXml}
            pivotTableDataSyncXml={this.pivotTableDataSyncXml}
            tableType={this.tableType}
            ref={el => (this.pivotRef = el)}
          ></gx-query-viewer-pivot>
        </Host>
      );
    }
    return (
      <Host>
        <gx-query-viewer-pivot
          pivotCollection={pivotCollection}
          pivotParameters={pivotParameters}
          pageDataForTable={this.pageDataForTable}
          attributeValuesForTableXml={this.attributeValuesForTableXml}
          tableDataSyncXml={this.tableDataSyncXml}
          tableType={this.tableType}
          ref={el => (this.pivotRef = el)}
        ></gx-query-viewer-pivot>
      </Host>
    );
  }
}
