
# ===== CDIO Phase Endpoints (SQLAlchemy) =====

@app.post("/api/v1/charters", response_model=schemas.ProjectCharter)
def create_charter(charter_data: schemas.ProjectCharterCreate, project_id: int = Query(..., alias="project_id"), db: Session = Depends(get_db)):
    """Submit a project charter (Conceive phase)"""
    # Check if project exists
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if charter already exists
    if project.charter:
        raise HTTPException(status_code=400, detail="Charter already exists for this project")
    
    # Create charter
    new_charter = models.ProjectCharter(
        project_id=project_id,
        problem_statement=charter_data.problem_statement,
        success_metrics=charter_data.success_metrics,
        target_outcome=charter_data.target_outcome,
        constraints=charter_data.constraints,
        stakeholders=charter_data.stakeholders,
        suggested_tools=[], # AI can populate this later
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_charter)
    db.commit()
    db.refresh(new_charter)
    
    # Update project status
    project.current_phase = "design"
    project.conceive_completed = True
    project.overall_status = "in_progress"
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    # Auto-capture to PKC (Knowledge Node)
    # For MVP, we just create the node
    try:
        node_content = f"Problem: {new_charter.problem_statement}\nMetrics: {new_charter.success_metrics}"
        pkc_node = models.KnowledgeNode(
            user_id=project.user_id,
            title=f"Charter: {project.project_title}",
            content=node_content,
            node_type="project_artifact",
            source_id=str(new_charter.id),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(pkc_node)
        db.commit()
    except Exception as e:
        print(f"Failed to auto-capture to PKC: {e}")

    return new_charter

@app.get("/api/v1/projects/{project_id}/charter", response_model=schemas.ProjectCharter)
def get_charter(project_id: int, db: Session = Depends(get_db)):
    """Get project charter"""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.charter:
        raise HTTPException(status_code=404, detail="Charter not found")
        
    return project.charter

@app.post("/api/v1/blueprints", response_model=schemas.DesignBlueprint)
def create_blueprint(blueprint_data: schemas.DesignBlueprintCreate, project_id: int = Query(..., alias="project_id"), db: Session = Depends(get_db)):
    """Submit a design blueprint (Design phase)"""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.blueprint:
        raise HTTPException(status_code=400, detail="Blueprint already exists")
        
    new_blueprint = models.DesignBlueprint(
        project_id=project_id,
        architecture_diagram=blueprint_data.architecture_diagram,
        logic_flow=blueprint_data.logic_flow,
        component_list=blueprint_data.component_list,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_blueprint)
    db.commit()
    db.refresh(new_blueprint)
    
    project.current_phase = "implement"
    project.design_completed = True
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return new_blueprint

@app.get("/api/v1/projects/{project_id}/blueprint", response_model=schemas.DesignBlueprint)
def get_blueprint(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return project.blueprint

@app.post("/api/v1/implementations", response_model=schemas.Implementation)
def create_implementation(impl_data: schemas.ImplementationCreate, project_id: int = Query(..., alias="project_id"), db: Session = Depends(get_db)):
    """Submit implementation (Implement phase)"""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check if exists (optional, maybe allow updates? For now assume new)
    if project.implementation:
        # Update existing
        impl = project.implementation
        impl.code_repository_url = impl_data.code_repository_url
        impl.code_snapshot = impl_data.code_snapshot
        impl.notes = impl_data.notes
        impl.updated_at = datetime.utcnow()
    else:
        impl = models.Implementation(
            project_id=project_id,
            code_repository_url=impl_data.code_repository_url,
            code_snapshot=impl_data.code_snapshot,
            notes=impl_data.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(impl)
    
    db.commit()
    db.refresh(impl)
    
    project.current_phase = "operate"
    project.implement_completed = True
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return impl

@app.get("/api/v1/projects/{project_id}/implementation", response_model=schemas.Implementation)
def get_implementation(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    return project.implementation

@app.post("/api/v1/deployments", response_model=schemas.Deployment)
def create_deployment(deploy_data: schemas.DeploymentCreate, project_id: int = Query(..., alias="project_id"), db: Session = Depends(get_db)):
    """Submit deployment (Operate phase)"""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.deployment:
        deploy = project.deployment
        deploy.deployment_url = deploy_data.deployment_url
        deploy.deployment_platform = deploy_data.deployment_platform
        deploy.readme = deploy_data.readme
        deploy.updated_at = datetime.utcnow()
    else:
        deploy = models.Deployment(
            project_id=project_id,
            deployment_url=deploy_data.deployment_url,
            deployment_platform=deploy_data.deployment_platform,
            readme=deploy_data.readme,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(deploy)
        
    db.commit()
    db.refresh(deploy)
    
    project.operate_completed = True
    project.overall_status = "completed"
    project.completion_percentage = 100
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return deploy

@app.get("/api/v1/projects/{project_id}/deployment", response_model=schemas.Deployment)
def get_deployment(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return project.deployment
