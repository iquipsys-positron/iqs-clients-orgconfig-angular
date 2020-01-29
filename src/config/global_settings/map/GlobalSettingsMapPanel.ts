declare var google;

interface IGlobalSettingsMapPanelBindings {
    [key: string]: any;
}

const GlobalSettingsMapPanelBindings: IGlobalSettingsMapPanelBindings = {}

class GlobalSettingsMapPanelChanges implements ng.IOnChangesObject, IGlobalSettingsMapPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class GlobalSettingsMapPanelController implements ng.IController {
    public $onInit() { }
    public site: iqs.shell.Organization;
    private transaction: pip.services.Transaction;
    private zoomLevel: number;
    public isShowMap: boolean = true;
    private isFirst: boolean = true;
    private _mapControl: any;
    public mapOptions: any;
    public siteCenter: any;
    public startPause: boolean = true;
    public overlay: any;
    public state: any;
    public progress: number = 0;
    public section: number;
    public sections: any[] = [
        {
            title: 'Pan',
            type: 'pan',
            id: 0
        }, {
            title: 'RECTANGLE',
            type: 'rectangle',
            id: 1
        }
    ];
    private isExit: boolean = false;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        private $http: ng.IHttpService,
        private $q: ng.IQService,
        private pipRest: pip.rest.IRestService,
        private pipPictureData: pip.pictures.IPictureDataService,
        private pipFileUpload: pip.files.IFileUploadService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsOrganizationsViewModel: iqs.shell.IOrganizationsViewModel,
        private pipTransaction: pip.services.ITransactionService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsMapViewModel: iqs.shell.IMapViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('sites');
        const runWhenReady = () => {
            this.site = _.cloneDeep(this.iqsOrganizationsViewModel.getOrganizationById(this.iqsOrganization.site.id));
            this.iqsMapViewModel.map.init(() => { });
            this.zoomLevel = 11;

            this.$timeout(() => {
                this.siteCenter = [angular.extend(this.iqsMapConfig.siteCenter, { id: 0 })];
                this.onUpdateMapConfig();
                this.startPause = false;
            }, 1000);

            this.section = 0;
            this.setOverlay();
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.isExit = true;
        this.updateOrganization();
        for (const f of this.cf) { f(); }
    }

    private updateOrganization() {
        this.transaction.begin('update_site');
        this.iqsOrganizationsViewModel.updateOrganization(
            this.site,
            (site: iqs.shell.Organization) => {
                this.iqsOrganization.updateOrganization(site);
                this.site = _.cloneDeep(site);
                this.iqsMapConfig.getConfigsFromOrganization();
                this.transaction.end();
                if (!this.isExit) this.onUpdateMapConfig();
            },
            (err: any) => {
                this.transaction.end(err);
            }
        );
    }

    private toCenterEmbeded() {
        this.mapOptions.center = {
            latitude: (this.site.map_north + this.site.map_south) / 2,
            longitude: (this.site.map_east + this.site.map_west) / 2
        };
    }

    private setOverlay(isCoordChange?: boolean): void {
        if (this.site.map_east && this.site.map_north && this.site.map_south && this.site.map_west) {
            if (!this.overlay) {
                this.overlay = {
                    bounds: {
                        north: this.site.map_north,
                        east: this.site.map_east,
                        south: this.site.map_south,
                        west: this.site.map_west
                    },
                    type: 'rectangle'
                };
            } else {
                this.overlay.bounds = {
                    north: this.site.map_north,
                    east: this.site.map_east,
                    south: this.site.map_south,
                    west: this.site.map_west
                }
                if (isCoordChange) {
                    this.overlay = _.cloneDeep(this.overlay);
                }
            }
        }
    }

    public selectSection(sectionIndex) {
        this.section = sectionIndex;
        const section = this.sections[this.section];
        this.changeType(this.sections[this.section].type);
    }

    public clearMap() {
        this._mapControl.clearMap();
        this.changeType('pan');
        this.section = 0;
    }

    private changeType(type) {
        if (!this._mapControl) return;

        switch (type) {
            case 'rectangle':
                this._mapControl.addRectangle();
                break;
            case 'pan':
                this._mapControl.drawingManagerOptions.drawingMode = null;
                break;
        }
    }

    public onUpdateMapConfig(isCoordChange?: boolean): void {
        if (!this.site) return;
        let center = _.cloneDeep(this.site.center);

        if (!this.mapOptions) {
            this.mapOptions = angular.extend(_.cloneDeep(this.iqsMapConfig.siteConfigs), {
                center: {
                    latitude: center.coordinates[1],
                    longitude: center.coordinates[0]
                },
                map: {
                    mapTypeId: 'hybrid'
                }
            });
        }


        this.mapOptions.isCoordChange = isCoordChange;

        if (!this.isShowMap || !this.site.map_id) {
            this.mapOptions.embededMap = null;
        } else {
            if (_.isNumber(this.site.map_north) && _.isNumber(this.site.map_east)
                && _.isNumber(this.site.map_south) && _.isNumber(this.site.map_west)) {
                this.mapOptions.embededMap = {};
                this.mapOptions.embededMap.opacity = 0.5;
                this.mapOptions.embededMap.embededSrc = this.pipPictureData.getPictureUrl(this.site.map_id);
                this.mapOptions.embededMap.map_east = this.site.map_east;
                this.mapOptions.embededMap.map_north = this.site.map_north;
                this.mapOptions.embededMap.map_south = this.site.map_south;
                this.mapOptions.embededMap.map_west = this.site.map_west;
            }
        }

        this.setOverlay(isCoordChange);

        if (this.isFirst) {
            if (this.site.map_east && this.site.map_north && this.site.map_south && this.site.map_west) {
                this.toCenterEmbeded();
            } else {
                this.toCenter();
            }
            this.mapOptions.zoom = this.zoomLevel;
            this.mapOptions.isEmbeded = this.isShowMap;
            this.isFirst = false;
        }
    }

    public onChangeCoordinates() {
        if (this.site.map_east && this.site.map_north && this.site.map_south && this.site.map_west) {
            this.onUpdateMapConfig(true);
        }
    }

    public isEmbededMap(): void {
        this.isShowMap = !this.isShowMap;
        this.onUpdateMapConfig();
    }

    // Process user actions
    public onLoad($files: any): void {
        if ($files == null || $files.length == 0) { return; }

        this.state = null;
        $files.forEach((file) => {
            if (file.type.indexOf('image') > -1) {
                this.$timeout(() => {
                    let fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    fileReader.onload = (e) => {
                        this.$timeout(() => {
                            this.savePicture(file);
                        });
                    }
                });
            }
        });
    }

    public savePicture(file): void {
        if (!file) return;

        if (this.site.map_id) {
            this.transaction.begin('IMAGE_DELETE');
            let url: string = this.pipRest.serverUrl + '/api/v1/blobs/' + this.site.map_id;
            let fd: FormData = new FormData();
            fd.append('file', file);
            let cancelQuery = this.$q.defer()
            this.$http.put(
                url, fd, <any>{
                    timeout: cancelQuery.promise,
                    headers: {
                        'Content-Type': undefined,
                        'Access-Control-Allow-Origin': '*'
                    }
                })
                .then(
                    (response: any) => {
                        this.transaction.end();
                        this.updateOrganization();
                    },
                    (error: any) => {
                        this.transaction.end(error);
                    });
        } else {
            this.transaction.begin('IMAGE_DELETE');
            this.pipFileUpload.upload(
                file,
                this.pipPictureData.postPictureUrl(),
                (data: any, error: any) => {
                    if (!error) {
                        this.site.map_id = data.id;
                        this.transaction.end();
                        this.updateOrganization();
                    } else {
                        this.transaction.end(error);
                    }
                },
                (state: pip.files.FileUploadState, progress: number) => {
                    this.state = state;
                    this.progress = progress;
                }
            );
        }
    }

    public onDelete(): void {
        if (this.site.map_id) {
            this.transaction.begin('IMAGE_DELETE');
            this.pipPictureData.deletePicture(
                this.site.map_id,
                () => {
                    this.site.map_id = null;
                    this.transaction.end();
                    this.updateOrganization();
                },
                (error: any) => {
                    this.transaction.end(error);
                });
        }
    }

    public setControl(control) {
        this._mapControl = control;
    }

    public onZoomIn() {
        if (!this._mapControl) return;

        const curZ = this._mapControl.map.control.getGMap().getZoom() + 1;
        this._mapControl.map.control.getGMap().setZoom(curZ);
    }

    public onZoomOut() {
        if (!this._mapControl) return;

        const curZ = this._mapControl.map.control.getGMap().getZoom() - 1;
        this._mapControl.map.control.getGMap().setZoom(curZ);
    }

    public onEdit(bounds) {
        if (!bounds || _.isEmpty(bounds)) return;

        this.$timeout(() => {
            this.site.map_south = bounds.south;
            this.site.map_north = bounds.north;
            this.site.map_east = bounds.east;
            this.site.map_west = bounds.west;
            this.onUpdateMapConfig(true);
        }, 0);
    }

    public toCenter() {
        let center = _.cloneDeep(this.site.center);
        if (this._mapControl) this._mapControl.map.control.getGMap().panTo(new google.maps.LatLng(
            center.coordinates[1],
            center.coordinates[0]
        ));
    }
}

(() => {

    function configureConfigGlobalMapTranslations(
        pipTranslateProvider: pip.services.ITranslateProvider
    ) {
        pipTranslateProvider.translations('en', {
            GLOBAL_SETTINGS_MAP_1: 'North (deg)',
            GLOBAL_SETTINGS_MAP_2: 'South (deg)',
            GLOBAL_SETTINGS_MAP_3: 'West (deg)',
            GLOBAL_SETTINGS_MAP_4: 'East (deg)',
            GLOBAL_SETTINGS_CHANGE_MAP: 'Change map',
            ZONE_HIDE_EMBEDED_MAP: 'Hide map image',
            ZONE_SHOW_EMBEDED_MAP: 'Show map image'
        });

        pipTranslateProvider.translations('ru', {
            GLOBAL_SETTINGS_MAP_1: 'Север (град)',
            GLOBAL_SETTINGS_MAP_2: 'Юг (град)',
            GLOBAL_SETTINGS_MAP_3: 'Запад (град)',
            GLOBAL_SETTINGS_MAP_4: 'Восток (град)',
            GLOBAL_SETTINGS_CHANGE_MAP: 'Загрузить карту',
            ZONE_HIDE_EMBEDED_MAP: 'Скрыть изображение карты',
            ZONE_SHOW_EMBEDED_MAP: 'Показать изображение карты'
        });
    }


    angular
        .module('iqsGlobalSettingsMapPanel', [])
        .component('iqsGlobalSettingsMapPanel', {
            bindings: GlobalSettingsMapPanelBindings,
            templateUrl: 'config/global_settings/map/GlobalSettingsMapPanel.html',
            controller: GlobalSettingsMapPanelController,
            controllerAs: '$ctrl'
        })
        .config(configureConfigGlobalMapTranslations);

})();
