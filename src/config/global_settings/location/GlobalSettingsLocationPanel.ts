class TimeZoneItem {
    public name: string;
    public title: string;
    public offset?: string;
    public timeType?: string;
    public timeTypeFull?: string;
}

interface IGlobalSettingsLocationPanelBindings {
    [key: string]: any;
}

const GlobalSettingsLocationPanelBindings: IGlobalSettingsLocationPanelBindings = {}

class GlobalSettingsLocationPanelChanges implements ng.IOnChangesObject, IGlobalSettingsLocationPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class GlobalSettingsLocationPanelController implements ng.IController {
    public $onInit() { }
    public site: iqs.shell.Organization;
    public zones: TimeZoneItem[];
    public mapOptions: any = {};
    public siteOverlay: any = {};
    public startPause: boolean = true;
    public onChangeOrganization: () => void;
    public debouncedOnEdit: (overlay, type, path, center, radius) => void;
    public section: any;
    public sections: any[] = [
        {
            title: 'Pan',
            type: 'pan',
            id: 0
        }, {
            title: 'CENTER',
            type: 'center',
            id: 1
        }
    ];
    public languages: string[];
    private _mapControl: any;
    private transaction: pip.services.Transaction;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsOrganizationsViewModel: iqs.shell.IOrganizationsViewModel,
        private $timeout: ng.ITimeoutService,
        private pipTranslate: pip.services.ITranslateService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('sites');
        const runWhenReady = () => {
            this.languages = pipTranslate.translateSet(['ru', 'en'], null, null);
            // todo: if site not found?
            this.site = _.cloneDeep(this.iqsOrganizationsViewModel.getOrganizationById(this.iqsOrganization.site.id));
            if (this.site && !this.site.language) {
                this.site.language = this.pipTranslate.language;
                this.updateOrganization();
            }
            if (!this.site.center || !this.site.center.type) {
                this.site.center = { type: 'Point', coordinates: [] }
            }
            this.onChangeOrganization = this.updateOrganization;
            this.debouncedOnEdit = this.onEdit;

            this.fillZone();

            this.mapOptions = {
                center: this.site.center && this.site.center.coordinates && this.site.center.coordinates.length > 0 ? {
                    latitude: this.site.center.coordinates[1],
                    longitude: this.site.center.coordinates[0]
                } : {
                        latitude: 43.1195378,
                        longitude: -4.4398428
                    },
                zoom: this.site && this.site.radius ? this.iqsMapConfig.radiusToZoom(this.site.radius) : 3,
                map: {
                    mapTypeId: 'hybrid'
                }
            };
            this.section = 0;
            this.setOverlay();

            this.$timeout(() => {
                this.startPause = false;
            }, 1000);
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.updateOrganization();
        for (const f of this.cf) { f(); }
    }

    private fillZone() {
        let zones: string[];
        zones = moment.tz.names();
        this.zones = [];

        _.each(zones, (zone: string) => {
            let key: string = zone;
            let offset: string = moment.tz(zone).format('Z');
            let timeType: string = moment.tz(zone).format('z');
            let timeTypeFull: string = moment.tz(zone).format('zz');
            let title: string = zone;
            if (offset) {
                title += ' (' + offset + ')';
            }
            let tzItem: TimeZoneItem = <TimeZoneItem>{
                name: zone,
                offset: offset,
                timeType: timeType,
                timeTypeFull: timeTypeFull,
                title: title
            };
            this.zones.push(tzItem);
        });

        this.zones = _.sortBy(this.zones, (obj: TimeZoneItem) => {
            return obj.offset;
        });
    }

    public updateOrganization() {
        this.transaction.begin('update_site');
        this.iqsOrganizationsViewModel.updateOrganization(
            this.site,
            (site: iqs.shell.Organization) => {
                this.iqsOrganization.updateOrganization(site);
                this.site = _.cloneDeep(site);
                this.setOverlay();

                let zoom = this._mapControl.map.control.getGMap().getZoom();
                this.iqsMapConfig.getConfigsFromOrganization(() => {
                    this._mapControl.map.control.getGMap().setZoom(zoom);
                }, zoom);
                this.transaction.end();
            },
            (err: any) => {
                this.transaction.end(err);
            }
        );
    }

    public onEdit(overlay, type, path, center, radius) {
        if (!center || !center.lat || !center.lng || !radius) return;

        this.site.center.coordinates[0] = center.lng();
        this.site.center.coordinates[1] = center.lat();
        this.site.radius = radius / 1000;
        this.mapOptions.zoom = this._mapControl.map.control.getGMap().getZoom();
        this.updateOrganization();
    }

    public setControl(control) {
        this._mapControl = control;
    }

    public clearMap() {
        this._mapControl.clearMap();
        this.changeType('pan');
        this.section = 0;
    }

    private changeType(type) {
        if (!this._mapControl) return;

        switch (type) {
            case 'center':
                this._mapControl.addCircle();
                break;
            case 'pan':
                this._mapControl.drawingManagerOptions.drawingMode = null;
                break;
        }
    }

    public selectSection(sectionIndex) {
        this.section = sectionIndex;
        const section = this.sections[this.section];
        this.changeType(this.sections[this.section].type);
    }

    private setOverlay() {
        this.section = 0;
        this.siteOverlay = {
            type: 'circle',
            center: this.site.center,
            distance: this.site.radius * 1000
        };
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
}

(() => {
    function configureConfigGlobalLocationTranslations(
        pipTranslateProvider: pip.services.ITranslateProvider
    ) {
        pipTranslateProvider.translations('en', {
            GLOBAL_SETTINGS_LOCATION_LATTITUDE: 'Latitude (deg)',
            GLOBAL_SETTINGS_LOCATION_LONGITUDE: 'Longitude (deg)',
            GLOBAL_SETTINGS_LOCATION_DISTANSE: 'Radius (km)',
            GLOBAL_SETTINGS_LOCATION_TIMEZONE: 'Timezone'

        });

        pipTranslateProvider.translations('ru', {
            GLOBAL_SETTINGS_LOCATION_LATTITUDE: 'Широта (град)',
            GLOBAL_SETTINGS_LOCATION_LONGITUDE: 'Долгота (град)',
            GLOBAL_SETTINGS_LOCATION_DISTANSE: 'Радиус (км)',
            GLOBAL_SETTINGS_LOCATION_TIMEZONE: 'Временная зона'
        });
    }


    angular
        .module('iqsGlobalSettingsLocationPanel', [])
        .component('iqsGlobalSettingsLocationPanel', {
            bindings: GlobalSettingsLocationPanelBindings,
            templateUrl: 'config/global_settings/location/GlobalSettingsLocationPanel.html',
            controller: GlobalSettingsLocationPanelController,
            controllerAs: '$ctrl'
        })
        .config(configureConfigGlobalLocationTranslations)
})();
