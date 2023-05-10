import {Material, Mesh, MeshBuilder, PhysicsImpostor, Scene, Vector3} from "babylonjs";
import {BONUS_TYPES} from "./bonus-types";
import {COLLISION_GROUPS} from "./collision-groups";

export class BonusBlock {
    position: Vector3;
    scene: Scene;
    mesh: Mesh;
    bonusType: BONUS_TYPES;
    plusSizeMaterial: Material;
    superBallMaterial: Material;
    doubleBallMaterial: Material;
    bulletBonusMaterial: Material;
    extraLiveMaterial: Material;
    minusSizeMaterial: Material;
    energyMaterial: Material;


    constructor(position: Vector3, bonusType: BONUS_TYPES, scene: Scene, plusSizeMaterial: Material, superBallMaterial: Material,
        doubleBallMaterial: Material, bulletBonusMaterial: Material, minusSizeMaterial: Material, energyMaterial: Material, extraLiveMaterial: Material) {
        this.position = position;
        this.bonusType = bonusType;
        this.scene = scene;
        this.plusSizeMaterial = plusSizeMaterial;
        this.superBallMaterial = superBallMaterial;
        this.doubleBallMaterial = doubleBallMaterial;
        this.bulletBonusMaterial = bulletBonusMaterial;
        this.minusSizeMaterial = minusSizeMaterial;
        this.energyMaterial = energyMaterial;
        this.extraLiveMaterial = extraLiveMaterial;
        this.mesh = MeshBuilder.CreateCylinder('bonus', { diameter: 0.33, height: 0.33 }, this.scene);
        this.mesh.rotation = new Vector3(Math.PI, 0, Math.PI);
    }

    init() {
        this.position.y = 0.6;
        this.mesh.setAbsolutePosition(this.position);
        this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.SphereImpostor,
            { mass: 1, restitution: 1, friction: 0 });
        this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BONUSES;
        this.mesh.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.PADDLE | COLLISION_GROUPS.WALLS;
        this.mesh.physicsImpostor.onCollideEvent = function (self, other) {
            // @ts-ignore
            if (other.object.id === 'bonus' && self.object.id === 'bonus') {
                // @ts-ignore
                console.log('wow: ', self.object.collisionMask, self.object.collisionGroup, other.object.collisionMask, other.object.collisionGroup);
                // @ts-ignore
                console.log('and: ', self.object.collisionMask & other.object.collisionGroup)
            }
        }

        this.mesh.physicsImpostor.setLinearVelocity(new Vector3(0, 0, 3));
        setTimeout(() => this.mesh.physicsImpostor.setLinearVelocity(new Vector3(0, 0, 3)), 100);

        switch (this.bonusType) {
            case BONUS_TYPES.PLUS_SIZE:
                this.mesh.material = this.plusSizeMaterial;
                break;
            case BONUS_TYPES.SUPER_BALL:
                this.mesh.material = this.superBallMaterial;
                break;
            case BONUS_TYPES.DOUBLE_BALL:
                this.mesh.material = this.doubleBallMaterial;
                break;
            case BONUS_TYPES.MINUS_SIZE:
                this.mesh.material = this.minusSizeMaterial;
                break;
            case BONUS_TYPES.ENERGY:
                this.mesh.material = this.energyMaterial;
                break;
            case BONUS_TYPES.EXTRA_LIVE:
                this.mesh.material = this.extraLiveMaterial;
                break;
            case BONUS_TYPES.GUN:
                this.mesh.material = this.bulletBonusMaterial;
                break;
        }

        this.scene.onDisposeObservable.add(() => {
            if(!this.mesh.isDisposed()) {
                this.mesh.dispose();
            }
            this.plusSizeMaterial.dispose();
            this.minusSizeMaterial.dispose();
            this.doubleBallMaterial.dispose();
            this.bulletBonusMaterial.dispose();
            this.superBallMaterial.dispose();
        })
    }

    
}